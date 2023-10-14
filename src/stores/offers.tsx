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
import { toLimitOrder, TESTING, defer, getSymbol, IMarketProps, IOfferProps } from '../utils';
import { ethers } from 'ethers6';
import { detectTradeNetwork, hashOffer, isERC20Transfer } from '@pintswap/sdk';
import { useNetworkContext } from './network';

// Types
export type IOffersStoreProps = {
    userTrades: Map<string, IOffer>;
    addTrade: (hash: string, { gives, gets }: IOffer) => void;
    deleteTrade: (hash: string) => void;
    setUserTrades: Dispatch<SetStateAction<Map<string, IOffer>>>;
    isLoading: boolean;
    allOffers: Record<'nft' | 'erc20', IOfferProps[]>;
    offersByChain: Record<'nft' | 'erc20', IOfferProps[]>;
    uniqueMarkets: IMarketProps[];
};

// Context
const OffersContext = createContext<IOffersStoreProps>({
    userTrades: new Map(),
    addTrade(hash, { gives, gets }) {},
    deleteTrade(hash) {},
    setUserTrades: () => {},
    allOffers: { nft: [], erc20: [] },
    offersByChain: { nft: [], erc20: [] },
    isLoading: false,
    uniqueMarkets: [],
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

const toFlattened = memoize(
    async (v) =>
        await Promise.all(
            [...v.entries()].reduce(
                (r, [multiaddr, [_, offerList]]) =>
                    r.concat(
                        offerList.map(async (v: any) => ({
                            ...v,
                            peer: multiaddr,
                            chainId: 1,
                            // chainId: await detectTradeNetwork(v),
                            hash: hashOffer(v),
                        })),
                    ),
                [],
            ),
        ),
);

const filterByChain = (arr: any[], chainId: number) => arr.filter((el) => el.chainId === chainId);

// Wrapper
export function OffersStore(props: { children: ReactNode }) {
    const {
        pintswap: { module, chainId },
    } = usePintswapContext();
    const { newNetwork } = useNetworkContext();

    const [userTrades, setUserTrades] = useState<Map<string, IOffer>>(new Map());
    const [allOffers, setAllOffers] = useState<Record<'nft' | 'erc20', IOfferProps[]>>({
        nft: [],
        erc20: [],
    });
    const [offersByChain, setOffersByChain] = useState<Record<'nft' | 'erc20', IOfferProps[]>>({
        nft: [],
        erc20: [],
    });
    const [uniqueMarkets, setUniqueMarkets] = useState<IMarketProps[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const addTrade = (hash: string, tradeProps: IOffer) => {
        setUserTrades(userTrades.set(hash, tradeProps));
    };

    const deleteTrade = (hash: string) => {
        const foundTrade = userTrades.get(hash);
        if (foundTrade && module) {
            if (TESTING) console.log('#deleteTrade - Hash:', hash);
            module.offers.delete(hashOffer(foundTrade));
            const shallow = new Map(userTrades);
            shallow.delete(hash);
            setUserTrades(shallow);
        }
    };

    // Get Active Trades
    const listener = async () => {
        if ((module?.peers.size as any) > 0) {
            let signer: any;
            if (module?.signer?.provider) {
                signer = module.signer;
            } else {
                signer = new ethers.InfuraProvider('mainnet');
            }
            const availablePeers = (await resolveNames(module?.peers as any, module as any)) as any;
            const grouped = groupByType(availablePeers);
            // All trades converted to Array for DataTables
            const flattenedPairs = await toFlattened(grouped.erc20);
            const flattenedNftTrades = await toFlattened(grouped.nft);
            const mappedPairs = (
                await Promise.all(
                    flattenedPairs.map(async (v: any) => await toLimitOrder(v, chainId)),
                )
            ).map((v, i) => ({
                ...v,
                peer: flattenedPairs[i].peer,
                multiAddr: flattenedPairs[i].multiAddr,
            }));
            setAllOffers({ nft: flattenedNftTrades, erc20: mappedPairs });
            setIsLoading(false);
        }
    };

    // Listen for orderbook
    useEffect(() => {
        if (module) {
            module.on('/pubsub/orderbook-update', listener);
            return () => module.removeListener('/pubsub/orderbook-update', listener);
        }
        return () => {};
    }, [module]);

    // When orderbook updates, update offersByChain
    useEffect(() => {
        setOffersByChain({
            erc20: filterByChain(allOffers.erc20, chainId),
            nft: filterByChain(allOffers.nft, chainId),
        });
    }, [allOffers.erc20, chainId]);

    // Request all offers again (just in case)
    useEffect(() => {
        if (newNetwork) {
            (async () => {
                setIsLoading(true);
                await listener();
            })().catch((err) => console.error(err));
        }
    }, [newNetwork]);

    // Get unique ERC20 markets
    useEffect(() => {
        if (offersByChain.erc20) {
            const _uniqueMarkets: IMarketProps[] = [];
            offersByChain.erc20.forEach((m) => {
                const found = _uniqueMarkets.find((u) => u.quote === m.ticker);
                const price = parseFloat(m.price);
                const sum = parseFloat(m.amount);
                const isAsk = m.type === 'ask';
                if (found) {
                    found.offers += 1;
                    if (isAsk) {
                        found.buy.offers += 1;
                        if (found.buy.best > price) found.buy.best = price;
                        if (found.buy.sum < sum) found.buy.sum = sum;
                    } else {
                        found.sell.offers += 1;
                        if (found.sell.best < price) found.sell.best = price;
                        if (found.sell.sum < sum) found.sell.sum = sum;
                    }
                } else {
                    if (isAsk) {
                        _uniqueMarkets.push({
                            // quote: quoteToken,
                            // bases: [split[1]],
                            quote: m.ticker,
                            bases: [],
                            buy: {
                                offers: 1,
                                sum: sum,
                                best: price,
                            },
                            sell: {
                                offers: 0,
                                sum: 0,
                                best: 0,
                            },
                            offers: 1,
                        });
                    } else {
                        _uniqueMarkets.push({
                            // quote: quoteToken,
                            // bases: [split[1]],
                            quote: m.ticker,
                            bases: [],
                            buy: {
                                offers: 0,
                                sum: 0,
                                best: 0,
                            },
                            sell: {
                                offers: 1,
                                sum: sum,
                                best: price,
                            },
                            offers: 1,
                        });
                    }
                }
            });
            console.log('Unique markets:', _uniqueMarkets);
            setUniqueMarkets(_uniqueMarkets);
        }
    }, [offersByChain.erc20]);

    return (
        <OffersContext.Provider
            value={{
                userTrades,
                addTrade,
                setUserTrades,
                allOffers,
                deleteTrade,
                offersByChain,
                isLoading,
                uniqueMarkets,
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
