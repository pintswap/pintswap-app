import {
    createContext,
    Dispatch,
    ReactNode,
    SetStateAction,
    useContext,
    useEffect,
    useState,
} from 'react';
import { usePintswapContext } from './pintswap';
import {
    toLimitOrder,
    TESTING,
    defer,
    IMarketProps,
    IOfferProps,
    renderToast,
    savePintswap,
} from '../utils';
import { hashOffer, isERC20Transfer, detectTradeNetwork, IOffer } from '@pintswap/sdk';
import { useNetworkContext } from './network';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';

// Types
export type IOffersStoreProps = {
    userTrades: Map<string, IOffer>;
    addTrade: (hash: string, { gives, gets }: IOffer) => Promise<void>;
    deleteTrade: (hash: string) => Promise<void>;
    setUserTrades: Dispatch<SetStateAction<Map<string, IOffer>>>;
    isLoading: boolean;
    allOffers: Record<'nft' | 'erc20', IOfferProps[]>;
    offersByChain: Record<'nft' | 'erc20', IOfferProps[]>;
    uniqueMarkets: IMarketProps[];
    deleteAllTrades: () => Promise<void>;
};

// Context
const OffersContext = createContext<IOffersStoreProps>({
    userTrades: new Map(),
    async addTrade(hash, { gives, gets }) {},
    async deleteTrade(hash) {},
    setUserTrades: () => {},
    allOffers: { nft: [], erc20: [] },
    offersByChain: { nft: [], erc20: [] },
    isLoading: false,
    uniqueMarkets: [],
    deleteAllTrades: async () => {},
});

// Utils
(window as any).discoveryDeferred = defer();

const maybeResolveName = (name: string, pintswap: any) => {
    // TODO: fix later
    return name;
    // try {
    //     return await pintswap.resolveName(name);
    // } catch (e) {
    //     return name;
    // }
};

const resolveNames = async (m: any, pintswap: any) => {
    const flattened = [...m.entries()] as any;
    return new Map(
        // await Promise.all(
        flattened.map(([key, orders]: any[]) => {
            return [maybeResolveName(key, pintswap), orders];
        }),
        // ),
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

const toFlattened = async (v: any) =>
    await Promise.all(
        [...v.entries()].reduce(
            (r, [multiaddr, [_, offerList]]) =>
                r.concat(
                    offerList.map(async (v: any) => ({
                        ...v,
                        peer: multiaddr,
                        chainId: await detectTradeNetwork(v),
                        hash: hashOffer(v),
                    })),
                ),
            [],
        ),
    );

// Get unique ERC20 markets
const getUniqueMarkets = (offers: any[]) => {
    if (offers.length) {
        const _uniqueMarkets: IMarketProps[] = [];
        offers.forEach((m: any) => {
            const found = _uniqueMarkets.find((u) => u.quote === m.ticker);
            const price = parseFloat(m.price);
            const sum = parseFloat(m.amount) * price;
            const isBuy = m.type === 'ask';
            if (found) {
                found.offers += 1;
                if (isBuy) {
                    found.buy.offers = [...found.buy.offers, m.raw];
                    if (found.buy.best > price || found.buy.best === 0) found.buy.best = price;
                    if (found.buy.sum < sum) found.buy.sum = sum;
                } else {
                    found.sell.offers = [...found.sell.offers, m.raw];
                    if (found.sell.best < price || found.sell.best === 0) found.sell.best = price;
                    if (found.sell.sum < sum) found.sell.sum = sum;
                }
            } else {
                if (isBuy) {
                    const formatted = {
                        // quote: quoteToken,
                        // bases: [split[1]],
                        quote: m.ticker,
                        bases: [],
                        buy: {
                            tax: m.tax.buy,
                            offers: [m.raw],
                            sum: sum,
                            best: price,
                        },
                        sell: {
                            tax: m.tax.sell,
                            offers: [],
                            sum: 0,
                            best: 0,
                        },
                        offers: 1,
                    };
                    _uniqueMarkets.push(formatted);
                } else {
                    const formatted = {
                        // quote: quoteToken,
                        // bases: [split[1]],
                        quote: m.ticker,
                        bases: [],
                        buy: {
                            tax: m.tax.buy,
                            offers: [],
                            sum: 0,
                            best: 0,
                        },
                        sell: {
                            tax: m.tax.sell,
                            offers: [m.raw],
                            sum: sum,
                            best: price,
                        },
                        offers: 1,
                        tax: m.tax,
                    };
                    _uniqueMarkets.push(formatted);
                }
            }
        });
        return _uniqueMarkets;
    }
    return [];
};

const filterByChain = (arr: any[], chainId: number) => arr.filter((el) => el.chainId === chainId);

// Wrapper
export function OffersStore(props: { children: ReactNode }) {
    const {
        pintswap: { module, chainId, loading },
    } = usePintswapContext();
    const { newNetwork } = useNetworkContext();
    const { pathname } = useLocation();

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

    const addTrade = async (hash: string, tradeProps: IOffer) => {
        setUserTrades(new Map(userTrades.set(hash, tradeProps)));
        module && (await savePintswap(module));
    };

    const deleteTrade = async (hash: string) => {
        const foundTrade = module?.offers.get(hash);
        if (foundTrade && module) {
            if (TESTING) console.log('#deleteTrade - Hash:', hash);
            module.offers.delete(hash);
            const shallow = new Map(userTrades);
            shallow.delete(hash);
            setUserTrades(shallow);
            await savePintswap(module);
        }
    };

    const deleteAllTrades = async (e?: any) => {
        e && e.preventDefault();
        if (module) {
            module.offers.forEach((val, key) => module.offers.delete(key));
            setUserTrades(new Map());
            await savePintswap(module);
        }
    };

    // Get Active Trades
    const getPublicOrderbook = async () => {
        if (module?.peers?.size) {
            if (allOffers.erc20.length === 0 && !pathname.includes('/fulfill'))
                renderToast('findOffers', 'success', 'Connected successfully', undefined, 3000);
            const grouped = groupByType(module?.peers);
            // All trades converted to Array for DataTables
            const flattenedPairs = await toFlattened(grouped.erc20);
            const flattenedNftTrades = await toFlattened(grouped.nft);
            const mappedPairs = await Promise.all(
                flattenedPairs.map(
                    async (v: any) => await toLimitOrder(v, chainId, allOffers.erc20),
                ),
            );
            const returnObj = { nft: flattenedNftTrades, erc20: mappedPairs };
            setAllOffers(returnObj);

            if (mappedPairs.length) {
                const filtered = filterByChain(mappedPairs, chainId);
                setOffersByChain({
                    nft: filterByChain(flattenedNftTrades, chainId),
                    erc20: filtered,
                });
                setUniqueMarkets(getUniqueMarkets(filtered));
                setIsLoading(false);
            }
            return returnObj;
        }
        return { nft: [], erc20: [] };
    };

    // Listen for orderbook
    useQuery({
        queryKey: ['unique-markets', chainId],
        queryFn: getPublicOrderbook,
        refetchInterval: 1000 * 5,
        enabled: !!module && module.peers.size > 0,
    });
    useEffect(() => {
        if (module) {
            if (!allOffers.erc20.length && !pathname.includes('/fulfill'))
                renderToast('findOffers', 'pending', 'Connecting to P2P network');
            module.once('/pubsub/orderbook-update', getPublicOrderbook);
            return () => module.removeListener('/pubsub/orderbook-update', getPublicOrderbook);
        }
        return () => {};
    }, [module]);

    // When orderbook updates, update offersByChain
    useEffect(() => {
        setOffersByChain({
            erc20: filterByChain(allOffers.erc20, chainId),
            nft: filterByChain(allOffers.nft, chainId),
        });
    }, [allOffers.erc20.length, chainId]);

    // Request all offers again (just in case)
    useEffect(() => {
        if (newNetwork) {
            (async () => {
                setIsLoading(true);
                await getPublicOrderbook();
            })().catch((err) => console.error(err));
        }
    }, [newNetwork]);

    // Get user trades if any exist
    useEffect(() => {
        if (module) {
            setUserTrades(module.offers);
        }
    }, [module]);

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
                deleteAllTrades,
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
