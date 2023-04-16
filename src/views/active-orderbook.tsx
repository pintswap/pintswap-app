import { ImSpinner9 } from 'react-icons/im';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers6';
import { Card, Table } from '../components';
import { useTrade } from '../hooks/trade';
import { useGlobalContext } from '../stores/global';
import { convertAmount } from '../utils/common';
import { shorten } from '../utils/shorten';
import { memoize } from 'lodash';
import { sortLimitOrders, toLimitOrder } from '../utils/orderbook';
import { capitalCase } from 'change-case';

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

export const ActiveOrderbookView = () => {
    const navigate = useNavigate();
    const { pintswap, availableTrades } = useGlobalContext();
    const { error } = useTrade();
    const [limitOrders, setLimitOrders] = useState([]);

    useEffect(() => {
        (async () => {
            if (pintswap.module) {
                const signer = pintswap.module.signer || new ethers.InfuraProvider('mainnet');
                const flattened = toFlattened(availableTrades);
                const limitOrders = (
                    await Promise.all(
                        flattened.map(async (v: any) => await toLimitOrder(v, signer)),
                    )
                ).map((v, i) => ({
                    ...v,
                    peer: flattened[i].peer,
                }));
                setLimitOrders(sortLimitOrders(limitOrders as any));
            }
        })().catch((err) => console.error(err));
    }, [pintswap.module, availableTrades]);

    return (
        <div className="flex flex-col gap-6 font-titillium">
            <Card header="Open Trades" scroll>
                {/* TODO */}
                <Table
                    headers={['Peer', 'Pair', 'Type', 'Price', 'Amount']}
                    onClick={(trade: any) => navigate(`/${trade.peerFull}`)}
                    items={limitOrders.map((v: any) => {
                        const offer = { ...v };
                        const peerFull = v.peer;
                        const peer = shorten(peerFull);
                        const ary = [peer, v.ticker, capitalCase(v.type), v.price, v.amount] as any;
                        Object.defineProperty(ary, 'peerFull', {
                            value: peerFull,
                            writable: true,
                            configurable: true,
                            enumerable: false,
                        });
                        return ary;
                    })}
                    emptyContent={
                        pintswap.loading ? (
                            <ImSpinner9 className="animate-spin" size="20px" />
                        ) : (
                            <span>
                                {error ? (
                                    <span>
                                        Error loading available offers.{' '}
                                        <button
                                            onClick={() => navigate(0)}
                                            className="text-indigo-600 transition duration-200 hover:text-indigo-700"
                                        >
                                            Try refreshing.
                                        </button>
                                    </span>
                                ) : availableTrades.size === 0 ? (
                                    'No active offers'
                                ) : (
                                    'Loading available offers...'
                                )}
                            </span>
                        )
                    }
                />
            </Card>
        </div>
    );
};
