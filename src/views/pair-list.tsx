import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, DataTable } from '../components';
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

export const PairListView = () => {
    const { pathname } = useLocation();
    const { limitOrdersArr } = useOffersContext();
    const [pairOrders, setPairOrders] = useState({ bids: [], asks: [] });
    const pair = pathname.split('/')[2].toUpperCase().replace('-', ' / ');

    useEffect(() => {
        if (limitOrdersArr) {
            const duplicates = limitOrdersArr.filter(
                (obj) => obj.ticker === pair.replaceAll(' ', ''),
            );
            const split: any = { ...pairOrders };
            duplicates.map((el) => {
                if (el.type === 'bid') split.bids.push(el);
                else split.asks.push(el);
            });
            setPairOrders(split);
        }
    }, [limitOrdersArr]);

    console.log('order', limitOrdersArr);

    return (
        <div className="flex flex-col">
            <h2 className="view-header">{pair}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-3 lg:gap-4">
                <Card>
                    <h3 className="mb-2 lg:mb-0 text-center">Buys</h3>
                    <DataTable
                        type="explore"
                        columns={columns}
                        data={pairOrders.bids}
                        loading={limitOrdersArr.length === 0}
                        toolbar={false}
                        options={{
                            sortOrder: {
                                name: 'price',
                                direction: 'asc',
                            },
                        }}
                    />
                </Card>
                <Card>
                    <h3 className="mb-2 lg:mb-0 text-center">Sells</h3>
                    <DataTable
                        type="explore"
                        columns={columns}
                        data={pairOrders.asks}
                        loading={limitOrdersArr.length === 0}
                        toolbar={false}
                        options={{
                            sortOrder: {
                                name: 'price',
                                direction: 'desc',
                            },
                        }}
                    />
                </Card>
            </div>
        </div>
    );
};
