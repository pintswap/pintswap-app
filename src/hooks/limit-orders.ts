import { useState, useMemo, useEffect } from 'react';
import { memoize } from 'lodash';
import { isERC721Transfer, isERC20Transfer } from '@pintswap/sdk';
import { usePintswapContext, useOffersContext } from '../stores';
import { ethers } from 'ethers6';
import { toLimitOrder, filterERC20OffersForTicker, fromFormatted, orderTokens, getDecimals } from '../utils/orderbook';
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
    const { pintswap } = usePintswapContext();
    const { peerTrades } = useOffersContext();
    const { order } = useTrade();

    // All peers limit orders states
    const [limitOrders, setLimitOrders] = useState<any[]>([]);
    const [bidLimitOrders, setBidLimitOrders] = useState<any[]>([]);
    const [askLimitOrders, setAskLimitOrders] = useState<any[]>([]);
    
    // Current limit order states
    const [limitOrder, setLimitOrder] = useState({
        price: Number(0),
        amount: '',
        ticker: '',
        type: '',
    });
    const [outputAmount, setOutputAmount] = useState('');
    const [fillAmount, setFillAmount] = useState('');

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

    const toFlattened = memoize((v: any) =>
        mapToArray(v).map(([key, value]: any) => ({
            ...value,
            hash: key,
        })),
    );

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
    }, [peerTrades]);

    const forTicker =
        type === 'peer-ticker-orderbook'
            ? useMemo(() => {
                  return Object.fromEntries(
                      ['ask', 'bid'].map((type) => [
                          type,
                          filterERC20OffersForTicker(sorted.erc20 || [], ticker, type as any),
                      ]),
                  );
              }, [sorted])
            : null;

    // Subscribers
    useEffect(() => {
        if (type === 'peer-orderbook') {
            (async () => {
                if (pintswap.module) {
                    const signer = pintswap.module.signer || new ethers.InfuraProvider('mainnet');
                    const { erc20: flattened } = sorted;
                    const mapped = (
                        await Promise.all(
                            flattened.map(async (v: any) => await toLimitOrder(v, signer)),
                        )
                    ).map((v, i) => ({
                        ...v,
                        hash: flattened[i].hash,
                        peer: flattened[i].peer,
                        multiAddr: flattened[i].multiAddr,
                    }));
                    setLimitOrders(mapped);
                }
            })().catch((err) => console.error(err));
        } else if (type === 'peer-ticker-orderbook') {
            (async () => {
                if (pintswap.module && forTicker) {
                    const signer = pintswap.module.signer || new ethers.InfuraProvider('mainnet');
                    const flattened = forTicker.bid.concat(forTicker.ask);
                    const mapped = (
                        await Promise.all(
                            flattened.map(async (v: any) => await toLimitOrder(v, signer)),
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
            })().catch((err) => console.error(err));
        }
    }, [pintswap.module, peerTrades, order.multiAddr]);

    const filteredNfts = useMemo(
        () => sorted.nfts.filter((v: any) => isERC721Transfer(v.gives)),
        [sorted.nfts],
    );

    // Current trade subscriber
        useEffect(() => {
        if(type === 'fulfill') {
            (async () => {
                if (pintswap.module) {
                    const raw = await fromFormatted(trade, pintswap.module.signer);
                    const {
                        pair: [base, tradeToken],
                    } = orderTokens(raw);
                    const decimals = await getDecimals(tradeToken.address, pintswap.module.signer);
                    setFillAmount(ethers.formatUnits(tradeToken.amount, decimals));
                    const limitOrderRes = await toLimitOrder(raw as any, pintswap.module.signer);
                    console.log("LIMIT ORDER", limitOrderRes);
                    setLimitOrder(limitOrderRes as any);
                }
            })().catch((err) => console.error(err));
        }
    }, [trade, pintswap.module]);

    useEffect(() => {
        const m = pintswap.module;
        if (m && type === 'fulfill')
            (async () => {
                const raw = await fromFormatted(trade, m.signer);
                const {
                    pair: [base, tradeToken],
                } = orderTokens(raw);
                const [baseDecimals, tradeDecimals] = await Promise.all(
                    [base, tradeToken].map(async (v) => await getDecimals(v.address, m.signer)),
                );
                if (tradeToken.address === raw.gives.token) {
                    setOutputAmount(
                        Number(
                            ethers.formatUnits(
                                (ethers.toBigInt(ethers.parseUnits(fillAmount, tradeDecimals)) *
                                    ethers.toBigInt(raw.gets.amount)) /
                                    ethers.toBigInt(raw.gives.amount),
                                baseDecimals,
                            ),
                        ).toFixed(6),
                    );
                } else {
                    setOutputAmount(
                        Number(
                            ethers.formatUnits(
                                (ethers.toBigInt(ethers.parseUnits(fillAmount, baseDecimals)) *
                                    ethers.toBigInt(raw.gives.amount)) /
                                    ethers.toBigInt(raw.gets.amount),
                                baseDecimals,
                            ),
                        ).toFixed(6),
                    );
                }
            })().catch((err) => console.error(err));
    }, [pintswap.module, fillAmount, trade]);

    return {
        limitOrders,
        filteredNfts,
        sorted,
        ticker,
        bidLimitOrders,
        askLimitOrders,
        limitOrder,
        fillAmount,
        outputAmount,
        setFillAmount,

    };
};
