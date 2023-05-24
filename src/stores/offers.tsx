import {
    createContext,
    Dispatch,
    ReactNode,
    SetStateAction,
    useContext,
    useEffect,
    useState,
} from 'react';
import { IOffer } from '@pintswap/sdk';
import { defer, TESTING } from '../utils/common';
import { usePintswapContext } from './pintswap';
import { memoize } from 'lodash';
import { toLimitOrder } from '../utils/orderbook';
import { ethers } from 'ethers6';
import { hashOffer, isERC20Transfer } from '@pintswap/sdk/lib/trade';

// Types
export type IOffersStoreProps = {
    userTrades: Map<string, IOffer>;
    addTrade: (hash: string, { gives, gets }: IOffer) => void;
    deleteTrade: (hash: string) => void;
    peerTrades: Map<string, IOffer>;
    tokenTrades: Map<string, IOffer>;
    setPeerTrades: Dispatch<SetStateAction<Map<string, IOffer>>>;
    setUserTrades: Dispatch<SetStateAction<Map<string, IOffer>>>;
    setTokenTrades: Dispatch<SetStateAction<Map<string, IOffer>>>;
    limitOrdersArr: any[];
};

// Context
const OffersContext = createContext<IOffersStoreProps>({
    userTrades: new Map(),
    peerTrades: new Map(),
    tokenTrades: new Map(),
    addTrade(hash, { gives, gets }) {},
    deleteTrade(hash) {},
    setUserTrades: () => {},
    setPeerTrades: () => {},
    setTokenTrades: () => {},
    limitOrdersArr: [],
});

// Peer
(window as any).discoveryDeferred = defer();

const maybeResolveName = async (name: string, pintswap: any) => {
    try {
        return await pintswap.resolveName(name);
    } catch (e) {
        return name;
    }
};

const resolveNames = async (m: any, pintswap: any) => {
    const flattened = [...m.entries()] as any;
    return new Map(
        await Promise.all(
            flattened.map(async ([key, orders]: any[]) => {
                return [await maybeResolveName(key, pintswap), orders];
            }),
        ),
    );
};

const groupByType = (m: any) => {
    const flattened: any = [...m.entries()];
    return {
        erc20: new Map(
            flattened
                .map(([key, [hash, offers]]: any[]) => {
                    return [
                        key,
                        [
                            hash,
                            offers.filter(
                                (v: any) => isERC20Transfer(v.gets) && isERC20Transfer(v.gives),
                            ),
                        ],
                    ];
                })
                .filter(([key, orders]: any) => orders.length),
        ),
        nft: new Map(
            flattened
                .map(([key, [hash, offers]]: any[]) => {
                    return [
                        key,
                        [
                            hash,
                            offers.filter(
                                (v: any) => !(isERC20Transfer(v.gets) && isERC20Transfer(v.gives)),
                            ),
                        ],
                    ];
                })
                .filter(([key, orders]: any) => orders.length),
        ),
    };
};

// Utils
const toFlattened = memoize((v) =>
    [...v.entries()].reduce(
        (r, [multiaddr, [_, offerList]]) =>
            r.concat(
                offerList.map((v: any) => ({
                    ...v,
                    peer: multiaddr,
                })),
            ),
        [],
    ),
);

// Wrapper
export function OffersStore(props: { children: ReactNode }) {
    const { pintswap } = usePintswapContext();

    const [userTrades, setUserTrades] = useState<Map<string, IOffer>>(new Map());
    const [peerTrades, setPeerTrades] = useState<Map<string, IOffer>>(new Map());
    const [tokenTrades, setTokenTrades] = useState<Map<string, IOffer>>(new Map());
    const [limitOrdersArr, setLimitOrdersArr] = useState<any[]>([]);

    const addTrade = (hash: string, tradeProps: IOffer) => {
        setUserTrades(userTrades.set(hash, tradeProps));
    };

    const deleteTrade = (hash: string) => {
        const foundTrade = userTrades.get(hash);
        if(foundTrade && pintswap.module) {
            if(TESTING) console.log("#deleteTrade - Hash:", hash)
            pintswap.module.offers.delete(hashOffer(foundTrade))
            const shallow = new Map(userTrades);
            shallow.delete(hash);
            setUserTrades(shallow);
        }
    }

    // Get Active Trades
    useEffect(() => {
        const { module } = pintswap;
        if (module) {
            const listener = () => {
                (async () => {
                    if ((pintswap.module?.peers.size as any) > 0) {
                        const grouped = groupByType(
                            (await resolveNames(
                                pintswap.module?.peers as any,
                                pintswap.module as any,
                            )) as any,
                        );
                        setTokenTrades(grouped.erc20 as any);
                    }
                })().catch((err) => console.error(err));
            };
            module.on('/pubsub/orderbook-update', listener);
            return () => module.removeListener('/pubsub/orderbook-update', listener);
        }
        return () => {};
    }, [pintswap.module]);

    // All trades converted to Array for DataTables
    useEffect(() => {
        (async () => {
            if (pintswap.module) {
                const signer = pintswap.module.signer || new ethers.InfuraProvider('mainnet');
                const flattened = toFlattened(tokenTrades);
                const mapped = (
                    await Promise.all(
                        flattened.map(async (v: any) => await toLimitOrder(v, signer)),
                    )
                ).map((v, i) => ({
                    ...v,
                    peer: flattened[i].peer,
                    multiAddr: flattened[i].multiAddr,
                }));
                setLimitOrdersArr(mapped);
            }
        })().catch((err) => console.error(err));
    }, [pintswap.module, tokenTrades]);

    return (
        <OffersContext.Provider
            value={{
                userTrades,
                addTrade,
                peerTrades,
                setPeerTrades,
                setUserTrades,
                setTokenTrades,
                tokenTrades,
                limitOrdersArr,
                deleteTrade
            }}
        >
            {props.children}
        </OffersContext.Provider>
    );
}

// Independent
export function useOffersContext() {
    return useContext(OffersContext);
}
