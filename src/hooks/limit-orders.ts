import { useState, useMemo, useEffect } from 'react';
import { isERC721Transfer, isERC20Transfer } from '@pintswap/sdk';
import { usePintswapContext, useOffersContext } from '../stores';
import { ethers } from 'ethers6';
import { toLimitOrder, filterERC20OffersForTicker } from '../utils/orderbook';
import { useTrade } from './trade';
import { useParams } from 'react-router-dom';

type IUseLimitOrdersProps = 'peer-orderbook' | 'peer-ticker-orderbook' | 'fulfill';

const markIndex = (o: any, index: number) =>
    Object.defineProperty(o, 'index', {
        value: index,
        enumerable: false,
        writable: false,
        configurable: true,
    });

export const useLimitOrders = (type: IUseLimitOrdersProps) => {
    const { trade, base } = useParams();
    const {
        pintswap: { module, chainId },
    } = usePintswapContext();
    const { order, peerTrades } = useTrade();
    const { hash, multiaddr } = useParams();
    const { allOffers } = useOffersContext();

    // All peers limit orders states
    const [limitOrders, setLimitOrders] = useState<any[]>([]);
    const [bidLimitOrders, setBidLimitOrders] = useState<any[]>([]);
    const [askLimitOrders, setAskLimitOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Utils
    const ticker = `${trade}/${base}`;

    const mapToArray = (v: any) => {
        const it = v.entries();
        const result = [];
        let val;
        while ((val = it.next()) && !val.done) {
            result.push(val.value);
        }
        return result;
    };

    const toFlattened = (v: any) =>
        mapToArray(v).map(([key, value]: any) => ({
            ...value,
            hash: key,
        }));

    function groupByType(peerTrades: any) {
        const flattened = toFlattened(peerTrades);
        return {
            erc20: flattened.filter(({ gets, gives }: any) => {
                return isERC20Transfer(gets) && isERC20Transfer(gives);
            }),
            nfts: flattened.filter(({ gets, gives }: any) => {
                return !(isERC20Transfer(gets) && isERC20Transfer(gives));
            }),
        };
    }

    const sorted = useMemo(() => {
        return groupByType(peerTrades);
    }, [peerTrades.size]);

    const forTicker =
        type === 'peer-ticker-orderbook'
            ? useMemo(() => {
                  return Object.fromEntries(
                      ['ask', 'bid'].map((type) => [
                          type,
                          filterERC20OffersForTicker(
                              sorted.erc20 || [],
                              ticker,
                              type as any,
                              chainId,
                          ),
                      ]),
                  );
              }, [sorted.erc20.length, sorted.nfts.length])
            : null;

    // Subscribers
    useEffect(() => {
        (async () => {
            setLoading(true);
            if (type === 'peer-orderbook') {
                if (module) {
                    const { erc20: flattened } = sorted;
                    const mapped = (
                        await Promise.all(
                            flattened.map(
                                async (v: any) => await toLimitOrder(v, chainId, allOffers.erc20),
                            ),
                        )
                    ).map((v, i) => ({
                        ...v,
                        hash: flattened[i].hash,
                        peer: flattened[i].peer,
                        multiAddr: flattened[i].multiAddr,
                    }));
                    setLimitOrders(mapped);
                }
            } else if (type === 'peer-ticker-orderbook') {
                if (module && forTicker) {
                    const signer = module.signer || new ethers.InfuraProvider('mainnet');
                    const flattened = forTicker.bid.concat(forTicker.ask);
                    const mapped = (
                        await Promise.all(
                            flattened.map(
                                async (v: any) => await toLimitOrder(v, chainId, allOffers.erc20),
                            ),
                        )
                    ).map((v, i) => ({
                        ...v,
                        ...flattened[i],
                        hash: flattened[i].hash,
                    }));

                    let bidSum = 0;
                    const bidFilterAndSum = mapped
                        .filter((order) => order.type === 'bid')
                        .sort((a, b) => (a.price < b.price ? 1 : -1))
                        .map((order: any, i) => {
                            bidSum = bidSum + parseFloat(order.amount);
                            return markIndex(
                                {
                                    ...order,
                                    sum: parseFloat(bidSum + order.amount).toFixed(4),
                                },
                                i,
                            );
                        });
                    let askSum = 0;
                    const askFilterAndSum = mapped
                        .filter((order) => order.type === 'ask')
                        .sort((a, b) => (a.price > b.price ? 1 : -1))
                        .map((order: any, i) => {
                            askSum = askSum + parseFloat(order.amount);
                            return markIndex(
                                {
                                    ...order,
                                    sum: parseFloat(askSum + order.amount).toFixed(4),
                                },
                                i,
                            );
                        });

                    setBidLimitOrders(bidFilterAndSum);
                    setAskLimitOrders(askFilterAndSum);
                }
            }
            setLoading(false);
        })().catch((err) => console.error(err));
    }, [peerTrades.size, module, order.multiAddr]);

    const filteredNfts = useMemo(
        () => sorted.nfts.filter((v: any) => isERC721Transfer(v.gives)),
        [sorted.nfts.length, multiaddr],
    );

    return {
        limitOrders,
        filteredNfts,
        sorted,
        ticker,
        bidLimitOrders,
        askLimitOrders,
        loading,
    };
};
