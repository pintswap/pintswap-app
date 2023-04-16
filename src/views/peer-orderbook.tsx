import { ethers } from 'ethers6';
import { ImSpinner9 } from 'react-icons/im';
import { useNavigate } from 'react-router-dom';
import { Card, CopyClipboard, Skeleton, Table } from '../components';
import { useTrade } from '../hooks/trade';
import { useGlobalContext } from '../stores/global';
import { toLimitOrder } from '../utils/orderbook';
import { convertAmount } from '../utils/common';
import { capitalCase } from 'change-case';
import { groupBy, memoize } from 'lodash';
import { useEffect, useState } from 'react';

const groupTickers = (limitOrders: any) => Object.entries(groupBy(limitOrders as any, 'ticker') as any);

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

export const PeerOrderbookView = () => {
    const navigate = useNavigate();
    const { pintswap, peerTrades } = useGlobalContext();
    const { error, order } = useTrade();
    const [limitOrders, setLimitOrders] = useState([]);
    useEffect(() => {
        (async () => {
            if (pintswap.module) {
                const signer = pintswap.module.signer || new ethers.InfuraProvider('mainnet');
                const flattened = toFlattened(peerTrades);
                const limitOrders = (
                    await Promise.all(
                        flattened.map(async (v: any) => await toLimitOrder(v, signer)),
                    )
                ).map((v, i) => ({
                    ...v,
                    hash: flattened[i].hash,
                    peer: flattened[i].peer,
                    multiAddr: flattened[i].multiAddr,
                }));
                setLimitOrders(groupTickers(limitOrders) as any);
            }
        })().catch((err) => console.error(err));
    }, [pintswap.module, peerTrades]);

    return (
        <div className="flex flex-col gap-6 font-titillium">
            <div className="text-center self-center">
                <p className="text-sm">Multi Address</p>
                <Skeleton loading={pintswap.loading}>
                    <CopyClipboard
                        value={order.multiAddr || ethers.ZeroAddress}
                        truncate={5}
                        icon
                        lg
                    />
                </Skeleton>
            </div>
            <Card header="Open Trades" scroll>
		{ limitOrders.map(([ pair, orders ]) => <><h2>{ pair }</h2>
                <Table
                    headers={['Hash', 'Type', 'Price', 'Amount']}
                    onClick={(trade: any) => navigate(`/${order.multiAddr}/${trade[0]}`)}
                    items={Array.from(orders, (entry: any) => [
                        entry.hash,
                        capitalCase(entry.type),
                        entry.price,
                        entry.amount,
                    ])}
                    emptyContent={
                        pintswap.loading ? (
                            <ImSpinner9 className="animate-spin" size="20px" />
                        ) : (
                            <span>
                                {error ? (
                                    <span>
                                        Error loading peer&apos;s trades.{' '}
                                        <button
                                            onClick={() => navigate(0)}
                                            className="text-indigo-600 transition duration-200 hover:text-indigo-700"
                                        >
                                            Try refreshing.
                                        </button>
                                    </span>
                                ) : (
                                    "Loading peer's trades..."
                                )}
                            </span>
                        )
                    }
                /></>)}
            </Card>
        </div>
    );
};
