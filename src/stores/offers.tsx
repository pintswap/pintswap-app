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
import { useGlobalContext } from './global';
import { memoize } from 'lodash';
import { toLimitOrder } from '../utils/orderbook';
import { ethers } from 'ethers6';
import { hashOffer, isERC20Transfer } from '@pintswap/sdk/lib/trade';

// Types
export type IOffersStoreProps = {
    openTrades: Map<string, IOffer>;
    addTrade: (hash: string, { gives, gets }: IOffer) => void;
    deleteTrade: (hash: string) => void;
    peerTrades: Map<string, IOffer>;
    availableTrades: Map<string, IOffer>;
    setPeerTrades: Dispatch<SetStateAction<Map<string, IOffer>>>;
    setOpenTrades: Dispatch<SetStateAction<Map<string, IOffer>>>;
    setAvailableTrades: Dispatch<SetStateAction<Map<string, IOffer>>>;
    limitOrdersArr: any[];
};

// Context
const OffersContext = createContext<IOffersStoreProps>({
    openTrades: new Map(),
    peerTrades: new Map(),
    availableTrades: new Map(),
    addTrade(hash, { gives, gets }) {},
    deleteTrade(hash) {},
    setOpenTrades: () => {},
    setPeerTrades: () => {},
    setAvailableTrades: () => {},
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
                    console.log(key, hash, offers);
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
    const { pintswap } = useGlobalContext();

    const [openTrades, setOpenTrades] = useState<Map<string, IOffer>>(new Map());
    const [peerTrades, setPeerTrades] = useState<Map<string, IOffer>>(new Map());
    const [availableTrades, setAvailableTrades] = useState<Map<string, IOffer>>(new Map());
    const [limitOrdersArr, setLimitOrdersArr] = useState<any[]>([]);

    const addTrade = (hash: string, tradeProps: IOffer) => {
        setOpenTrades(openTrades.set(hash, tradeProps));
    };

    const deleteTrade = (hash: string) => {
        const foundTrade = openTrades.get(hash);
        if(foundTrade && pintswap.module) {
            if(TESTING) console.log("#deleteTrade - Hash:", hash)
            pintswap.module.offers.delete(hashOffer(foundTrade))
            const shallow = new Map(openTrades);
            shallow.delete(hash);
            setOpenTrades(shallow);
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
                        setAvailableTrades(grouped.erc20 as any);
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
                const flattened = toFlattened(availableTrades);
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
    }, [pintswap.module, availableTrades]);

    return (
        <OffersContext.Provider
            value={{
                openTrades,
                addTrade,
                peerTrades,
                setPeerTrades,
                setOpenTrades,
                setAvailableTrades,
                availableTrades,
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
