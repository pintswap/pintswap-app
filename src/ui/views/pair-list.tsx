import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Asset, Card, Header } from '../components';
import { DataTable } from '../tables';
import { useOffersContext, usePintswapContext } from '../../stores';
import { useWindowSize } from '../../hooks';
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
    const {
        pintswap: { chainId, loading },
    } = usePintswapContext();
    const { width, breakpoints } = useWindowSize();
    const { pathname } = useLocation();
    const { offersByChain } = useOffersContext();
    const [pairOrders, setPairOrders] = useState({ bids: [], asks: [] });
    const pair = pathname.split('/')[2].toUpperCase().replace('-', ' / ');

    useEffect(() => {
        if (offersByChain?.erc20?.length) {
            const duplicates = offersByChain.erc20.filter(
                (obj) => obj.ticker === pair.replaceAll(' ', ''),
            );
            const split: any = { ...pairOrders };
            duplicates.map((el) => {
                if (el.type === 'bid') split.bids.push(el);
                else split.asks.push(el);
            });
            setPairOrders(split);
        } else {
            setPairOrders({ bids: [], asks: [] });
        }
    }, [offersByChain.erc20?.length, chainId]);

    return (
        <div className="flex flex-col">
            <div className="mb-4 md:mb-6">
                <Header
                    breadcrumbs={[
                        { text: 'Markets', link: '/markets' },
                        {
                            text: `${pathname.split('/')[2].toUpperCase()}`,
                            link: `/markets/${pathname.split('/')[2]}`,
                        },
                    ]}
                >
                    <span className="flex items-center gap-1">
                        <Asset symbol={pair?.split('/')[0] || ''} size={18} />
                        <span>/</span>
                        <Asset symbol={pair?.split('/')[1] || ''} size={18} />
                    </span>
                </Header>
            </div>

            {width > breakpoints.lg ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-3 lg:gap-4">
                    <Card>
                        <h3 className="mb-2 lg:mb-0 text-center">{`Buy ${pair?.split('/')[0]}`}</h3>
                        <DataTable
                            type="explore"
                            columns={columns}
                            data={pairOrders.asks}
                            loading={loading}
                            toolbar={false}
                            options={{
                                sortOrder: {
                                    name: 'price',
                                    direction: 'asc',
                                },
                            }}
                            trade="asks"
                            pagination
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
                            loading={loading}
                            toolbar={false}
                            options={{
                                sortOrder: {
                                    name: 'price',
                                    direction: 'desc',
                                },
                            }}
                            trade="bids"
                            pagination
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
                            loading={loading}
                            toolbar={false}
                            options={{
                                sortOrder: {
                                    name: 'price',
                                    direction: 'asc',
                                },
                            }}
                            trade="asks"
                            pagination
                        />
                    </Tab.Panel>
                    <Tab.Panel>
                        <DataTable
                            type="explore"
                            columns={columns}
                            data={pairOrders.bids}
                            loading={loading}
                            toolbar={false}
                            options={{
                                sortOrder: {
                                    name: 'price',
                                    direction: 'desc',
                                },
                            }}
                            trade="bids"
                            pagination
                        />
                    </Tab.Panel>
                </Card>
            )}
        </div>
    );
};
