import { ethers } from 'ethers6';
import { Card, CopyClipboard, DataTable, Table } from '../components';
import { useTrade } from '../hooks/trade';
import { useGlobalContext } from '../stores/global';
import { toLimitOrder } from '../utils/orderbook';
import { memoize } from 'lodash';
import { useEffect, useState } from 'react';
import { useOffersContext } from '../stores';
import { truncate } from '../utils/common';
import { useWindowSize } from '../hooks/window-size';

const columns = [
    {
        name: 'hash',
        label: 'Hash',
        options: {
            filter: false,
            sort: true,
            sortThirdClickReset: true,
        },
    },
    {
        name: 'ticker',
        label: 'Pair',
        options: {
            filter: true,
            sort: true,
            sortThirdClickReset: true,
        },
    },
    {
        name: 'type',
        label: 'Type',
        options: {
            filter: true,
            sort: true,
            sortThirdClickReset: true,
        },
    },
    {
        name: 'amount',
        label: 'Amount',
        options: {
            filter: false,
            sort: true,
            sortThirdClickReset: true,
        },
    },
    {
        name: 'price',
        label: 'Price',
        options: {
            filter: false,
            sort: true,
            sortThirdClickReset: true,
        },
    },
];

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
    const { pintswap } = useGlobalContext();
    const { peerTrades } = useOffersContext();
    const { width } = useWindowSize();
    const { order } = useTrade();
    const [limitOrders, setLimitOrders] = useState<any[]>([]);

    useEffect(() => {
        (async () => {
            if (pintswap.module) {
                const signer = pintswap.module.signer || new ethers.InfuraProvider('mainnet');
                const flattened = toFlattened(peerTrades);
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
    }, [pintswap.module, peerTrades]);

    return (
        <div className="flex flex-col gap-6">
            <Card 
                header={
                    <div className="w-full flex justify-between">
                        <span>Peer Trades</span>
                        <CopyClipboard value={order.multiAddr} icon={width > 768}>
                            <span className="font-medium">{truncate(order.multiAddr || ethers.ZeroAddress, width > 768 ? 4 : 3)}</span>
                        </CopyClipboard>
                    </div>
                }
                scroll={limitOrders.length > 0}
            >
                <DataTable 
                    title="Peer Trades"
                    columns={columns}
                    data={limitOrders}
                    loading={limitOrders.length === 0}
                    type="orderbook"
                    peer={order.multiAddr}
                />
            </Card>
        </div>
    );
};
