import { ethers } from 'ethers6';
import { Avatar, Card, DataTable } from '../components';
import { useTrade } from '../hooks/trade';
import { useGlobalContext } from '../stores/global';
import { toLimitOrder } from '../utils/orderbook';
import { memoize } from 'lodash';
import { useEffect, useState } from 'react';
import { useOffersContext } from '../stores';
import { useLocation } from 'react-router-dom';

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
    const { order } = useTrade();
    const [limitOrders, setLimitOrders] = useState<any[]>([]);
    const { state } = useLocation();

    const peer = state && state.peer ? state.peer : order.multiAddr

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
            <Avatar 
                peer={peer}
                withBio
                withName
                align='left'
                size={60}
                type='profile'
            />
            <Card 
                header={"Peer Trades"}
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
