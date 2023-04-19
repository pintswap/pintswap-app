import { ImSpinner9 } from 'react-icons/im';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers6';
import { Card, Table } from '../components';
import { useGlobalContext } from '../stores/global';
import { groupBy, memoize } from 'lodash';
import { sortLimitOrders, toLimitOrder } from '../utils/orderbook';
import { capitalCase } from 'change-case';
import { useOffersContext } from '../stores';
import { shorten } from '../utils/common';

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

export const ExploreView = () => {
    const navigate = useNavigate();
    const { pintswap } = useGlobalContext();
    const { availableTrades } = useOffersContext();
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
                setLimitOrders(
                    Object.entries(groupBy(sortLimitOrders(limitOrders as any), 'ticker')) as any,
                );
            }
        })().catch((err) => console.error(err));
    }, [pintswap.module, availableTrades]);

    return (
        <div className="flex flex-col gap-6">
            <Card header="Open Trades" scroll={limitOrders.length > 0}>
                {limitOrders.length > 0 ? limitOrders.map(([pair, orders]: any[], i) => (
                    <div key={`active-trades-row-${i}`} className="mt-2 first:mt-0">
                        <h2 className="text-indigo-600 mb-2">{pair}</h2>
                        <Table
                            headers={['Peer', 'Type', 'Price', 'Amount']}
                            onClick={(trade: any) => navigate(`/${trade.peerFull}`)}
                            items={orders.map((v: any) => {
                                const offer = { ...v };
                                const peerFull = v.peer;
                                const peer = shorten(peerFull);
                                const ary = [peer, capitalCase(v.type), v.price, v.amount] as any;
                                Object.defineProperty(ary, 'peerFull', {
                                    value: peerFull,
                                    writable: true,
                                    configurable: true,
                                    enumerable: false,
                                });
                                return ary;
                            })}
                        />
                        <br />
                    </div>
                )) : (
                    <span className="text-center w-full flex flex-col justify-center items-center gap-4">
                        <span className="text-gray-400">Loading available offers...</span>
                        <ImSpinner9 className="animate-spin text-gray-400" size="20px" />
                    </span>
                )}
            </Card>
        </div>
    );
};
