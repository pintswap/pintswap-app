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
import {
    toLimitOrder,
    TESTING,
    defer,
    IMarketProps,
    IOfferProps,
    updateToast,
    savePintswap,
} from '../utils';
import { hashOffer, isERC20Transfer } from '@pintswap/sdk';
import { useNetworkContext } from './network';
import { toast } from 'react-toastify';
import { useQuery } from '@tanstack/react-query';
import { usePricesContext } from './prices';

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

// Get unique ERC20 markets
const getUniqueMarkets = (offers: any[]) => {
    if (offers.length) {
        const _uniqueMarkets: IMarketProps[] = [];
        offers.forEach((m: any) => {
            const found = _uniqueMarkets.find((u) => u.quote === m.ticker);
            const price = parseFloat(m.price);
            const sum = parseFloat(m.amount);
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
    const { eth } = usePricesContext();

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
        if ((module?.peers.size as any) > 0) {
            if (!offersByChain.erc20.length && !uniqueMarkets.length)
                toast.update('findOffers', { render: 'Getting peer offers' });
            const availablePeers = (await resolveNames(module?.peers as any, module as any)) as any;
            if (!offersByChain.erc20.length)
                updateToast('findOffers', 'success', 'Returning peer offers');
            const grouped = groupByType(availablePeers);
            // All trades converted to Array for DataTables
            const flattenedPairs = await toFlattened(grouped.erc20);
            const flattenedNftTrades = await toFlattened(grouped.nft);
            const mappedPairs = (
                await Promise.all(
                    flattenedPairs.map(
                        async (v: any) => await toLimitOrder(v, chainId, allOffers.erc20),
                    ),
                )
            ).map((v, i) => ({
                ...v,
                peer: flattenedPairs[i].peer,
                multiAddr: flattenedPairs[i].multiAddr,
            }));
            const returnObj = { nft: flattenedNftTrades, erc20: mappedPairs };
            setAllOffers(returnObj);
            setUniqueMarkets(getUniqueMarkets(mappedPairs));
            setIsLoading(false);
            return returnObj;
        }
        return { nft: [], erc20: [] };
    };

    // Listen for orderbook
    // useQuery({
    //     queryKey: ['unique-markets'],
    //     queryFn: getPublicOrderbook,
    //     refetchInterval: 1000 * 6,
    //     enabled: !!module && module.peers.size > 0,
    // });
    useEffect(() => {
        if (module) {
            if (!allOffers.erc20.length)
                toast.loading('Connecting to P2P network', { toastId: 'findOffers' });
            module.on('/pubsub/orderbook-update', getPublicOrderbook);
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
