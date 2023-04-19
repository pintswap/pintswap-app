import { useState, useEffect } from 'react';
import { ethers } from 'ethers6';
import { DataTable } from '../components';
import { useGlobalContext } from '../stores/global';
import { memoize } from 'lodash';
import { toLimitOrder } from '../utils/orderbook';
import { useOffersContext } from '../stores';

const columns = [
    {
        name: 'peer',
        label: 'Peer',
        options: {
            filter: false,
            sort: true,
            sortThirdClickReset: true,
        },
    },
    {
        name: 'hash',
        label: 'Hash',
        options: {
            filter: false,
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
    const { pintswap } = useGlobalContext();
    const { availableTrades } = useOffersContext();
    const [limitOrders, setLimitOrders] = useState<any[]>([]);

    useEffect(() => {
        (async () => {
            if (pintswap.module) {
                const signer = pintswap.module.signer || new ethers.InfuraProvider('mainnet');
                const flattened = toFlattened(availableTrades);
                const mapped = (
                    await Promise.all(
                        flattened.map(async (v: any) => await toLimitOrder(v, signer)),
                    )
                ).map((v, i) => ({
                    ...v,
                    peer: flattened[i].peer,
                }));
                setLimitOrders(mapped)
            }
        })().catch((err) => console.error(err));
    }, [pintswap.module, availableTrades]);

    return (
        <div className="flex flex-col gap-6">
            <DataTable 
                title="Open Orders"
                columns={columns}
                data={limitOrders}
                loading={limitOrders.length === 0}
                type="explore"
            />
        </div>
    );
};
