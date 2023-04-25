import { Avatar, DataTable } from '../components';
import { useTrade } from '../hooks/trade';
import { useParams } from 'react-router-dom';
import { Fulfill } from "../components/fulfill";
import { useLimitOrders } from '../hooks';

const columns = [
    {
        name: 'price',
        label: 'Price',
        options: {
            filter: false,
            sort: true,
            sortThirdClickReset: true,
        },
    },
    {
        name: 'amount',
        label: 'Size',
        options: {
            filter: false,
            sort: true,
            sortThirdClickReset: true,
        },
    },
    {
        name: 'sum',
        label: 'Sum',
        options: {
            filter: false,
            sort: true,
            sortThirdClickReset: true,
        },
    },
];

export const PeerTickerOrderbookView = () => {
    const { order } = useTrade();
    const { multiaddr } = useParams();
    const { ticker, bidLimitOrders, askLimitOrders, forTicker } = useLimitOrders('peer-ticker-orderbook');

    const ordersShown = 10;
    return (
        <div className="flex flex-col gap-2 md:gap-3 lg:gap-4">
            <div className="flex items-center justify-between">
                <Avatar peer={multiaddr} withBio withName align="left" type="profile" />
                <span className="text-lg">{ticker}</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-3 lg:gap-4">
                <DataTable 
                    title="Bids"
                    type="bids"
                    columns={columns}
                    data={bidLimitOrders.slice(0, ordersShown)}
                    loading={bidLimitOrders.length === 0}
                    toolbar={false}
                    peer={order.multiAddr}
                    pagination={false}
                    options={{
                        sortOrder: {
                            name: 'price',
                            direction: 'asc'
                        }
                    }}
                />
                <DataTable 
                    title="Asks"
                    type="asks"
                    columns={columns}
                    data={askLimitOrders.slice(0, ordersShown)}
                    loading={askLimitOrders.length === 0}
                    toolbar={false}
                    peer={order.multiAddr}
                    pagination={false}
                    options={{
                        sortOrder: {
                            name: 'price',
                            direction: 'desc'
                        }
                    }}
                />
            </div>
            <Fulfill forTicker={ forTicker } />
        </div>
    );
};
