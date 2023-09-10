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
import { usePintswapContext } from './pintswap';
import { memoize } from 'lodash';
import { toLimitOrder, TESTING, defer } from '../utils';
import { ethers } from 'ethers6';
import { hashOffer, isERC20Transfer } from '@pintswap/sdk/lib/trade';

// Types
export type IOffersStoreProps = {
    userTrades: Map<string, IOffer>;
    addTrade: (hash: string, { gives, gets }: IOffer) => void;
    deleteTrade: (hash: string) => void;
    peerTrades: Map<string, IOffer>;
    setPeerTrades: Dispatch<SetStateAction<Map<string, IOffer>>>;
    setUserTrades: Dispatch<SetStateAction<Map<string, IOffer>>>;
    limitOrdersArr: any[];
};

// Context
const OffersContext = createContext<IOffersStoreProps>({
    userTrades: new Map(),
    peerTrades: new Map(),
    addTrade(hash, { gives, gets }) {},
    deleteTrade(hash) {},
    setUserTrades: () => {},
    setPeerTrades: () => {},
    limitOrdersArr: [],
});

// Utils
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

const withoutTag = (ary: any) => ary.filter(([key]: any) => !key.match('::'));

const groupByType = (m: any) => {
    const flattened: any = [...m.entries()];
    return {
        erc20: new Map(
            withoutTag(flattened)
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
            withoutTag(flattened)
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
    const { module } = pintswap;

    const [userTrades, setUserTrades] = useState<Map<string, IOffer>>(new Map());
    const [peerTrades, setPeerTrades] = useState<Map<string, IOffer>>(new Map());
    const [limitOrdersArr, setLimitOrdersArr] = useState<any[]>([]);

    const addTrade = (hash: string, tradeProps: IOffer) => {
        setUserTrades(userTrades.set(hash, tradeProps));
    };

    const deleteTrade = (hash: string) => {
        const foundTrade = userTrades.get(hash);
        if (foundTrade && pintswap.module) {
            if (TESTING) console.log('#deleteTrade - Hash:', hash);
            pintswap.module.offers.delete(hashOffer(foundTrade));
            const shallow = new Map(userTrades);
            shallow.delete(hash);
            setUserTrades(shallow);
        }
    };

    // Get Active Trades
    useEffect(() => {
        if (module) {
            const listener = async () => {
                if ((module?.peers.size as any) > 0) {
                    let signer: any;
                    if (module?.signer?.provider) {
                        signer = module.signer;
                    } else {
                        signer = new ethers.InfuraProvider('mainnet');
                    }
                    const grouped = groupByType(
                        (await resolveNames(module?.peers as any, module as any)) as any,
                    );
                    // All trades converted to Array for DataTables
                    const flattened = toFlattened(grouped.erc20);
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
            };
            module.on('/pubsub/orderbook-update', listener);
            return () => module.removeListener('/pubsub/orderbook-update', listener);
        }
        return () => {};
    }, [module]);

    return (
        <OffersContext.Provider
            value={{
                userTrades,
                addTrade,
                peerTrades,
                setPeerTrades,
                setUserTrades,
                limitOrdersArr,
                deleteTrade,
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
