import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Asset, Card, DataTable } from '../components';
import { useOffersContext } from '../stores';
import { useWindowSize } from '../hooks';
import { Tab } from '@headlessui/react';

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
    const { width, breakpoints } = useWindowSize();
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

    return (
        <div className="flex flex-col">
            <h2 className="view-header flex flex-row items-center justify-center gap-2">
                <Asset symbol={pair?.split('/')[0] || ''} size={18} />
                <span>/</span>
                <Asset symbol={pair?.split('/')[1] || ''} size={18} />
            </h2>
            {width > breakpoints.lg ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-3 lg:gap-4">
                    <Card>
                        <h3 className="mb-2 lg:mb-0 text-center">{`Buy ${pair?.split('/')[0]}`}</h3>
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
                            trade="buy"
                        />
                    </Card>
                    <Card>
                        <h3 className="mb-2 lg:mb-0 text-center">{`Sell ${
                            pair?.split('/')[0]
                        }`}</h3>
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
                            trade="sell"
                        />
                    </Card>
                </div>
            ) : (
                <Card type="tabs" tabs={['Buy', 'Sell']}>
                    <Tab.Panel>
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
                            trade="buy"
                        />
                    </Tab.Panel>
                    <Tab.Panel>
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
                            trade="sell"
                        />
                    </Tab.Panel>
                </Card>
            )}
        </div>
    );
};
