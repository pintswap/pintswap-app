import { Avatar, DataTable, PeerTickerFulfill, Card, Asset } from '../components';
import { useTrade } from '../hooks/trade';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useLimitOrders } from '../hooks';
import { ethers } from 'ethers6';
import { useEffect, useState } from 'react';
import { Tab } from '@headlessui/react';

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
    const navigate = useNavigate();
    const { order } = useTrade();
    const { multiaddr, base: baseAsset, trade: tradeAsset } = useParams();
    const { ticker, bidLimitOrders, askLimitOrders, loading } =
        useLimitOrders('peer-ticker-orderbook');
    const { state } = useLocation();
    const [matchInputs, setMatchInputs] = useState<any>({
        amount: '',
        list: [],
    });
    const [tradeType, _setTradeType] = useState('');
    const [activeIndex, setActiveIndex] = useState('');

    const setTradeType = (v: any) => {
        _setTradeType(v);
    };

    const onClickRow = (row: any) => {
        const [tradeType, price, size, sum] = row;
        const { index } = row;
        setActiveIndex(`${tradeType}-${index}`);
        let list = tradeType.match('bids') ? bidLimitOrders : askLimitOrders;
        setTradeType(tradeType);
        setMatchInputs({
            amount: list
                .slice(0, index + 1)
                .reduce((r, v) => ethers.toBigInt(v.gets.amount) + r, ethers.toBigInt(0)),
            list,
        });
    };

    useEffect(() => {
        let list = tradeType === 'bids' ? bidLimitOrders : askLimitOrders;
        setMatchInputs({
            amount: matchInputs.amount || '0',
            list,
        });
    }, [tradeType]);

    useEffect(() => {
        if (state?.trade && state?.data?.length) {
            const {
                trade,
                data: [multiAddr, size, price],
            } = state;
            let list = trade.match('bids') ? bidLimitOrders : askLimitOrders;
            if (list?.length) {
                setTradeType(trade);
                const index = list?.findIndex(
                    (val) => val?.amount === size && val?.price === price,
                );
                setActiveIndex(`${trade}-${index}`);
                setMatchInputs({
                    amount: list
                        .slice(0, index + 1)
                        .reduce((r, v) => ethers.toBigInt(v.gets.amount) + r, ethers.toBigInt(0)),
                    list,
                });
            }
        }
    }, [state, bidLimitOrders, askLimitOrders]);

    const peer = state?.peer ? state.peer : multiaddr;

    const ordersShown = 10;
    return (
        <div className="flex flex-col gap-2 md:gap-3 lg:gap-4">
            <div className="flex items-center justify-between">
                <button onClick={() => navigate(`/${peer}`)} className="w-fit text-left">
                    <Avatar
                        peer={multiaddr}
                        withBio
                        withName
                        nameClass="text-xl"
                        type="profile"
                        size={60}
                    />
                </button>
                <span className="text-sm md:text-md xl:text-lg">
                    <span className="flex flex-col justify-end text-left gap-0.5">
                        <Asset symbol={ticker?.split('/')[0]} size={16} />
                        <hr className="border opacity-25" />
                        <Asset symbol={ticker?.split('/')[1]} size={16} />
                    </span>
                </span>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 md:gap-3 lg:gap-4">
                <div>
                    <PeerTickerFulfill
                        matchInputs={matchInputs}
                        setMatchInputs={setMatchInputs}
                        tradeType={tradeType}
                        setTradeType={setTradeType}
                    />
                </div>
                <Card tabs={['Bids', 'Asks']} type="tabs" defaultTab={state?.trade || ''}>
                    <Tab.Panel>
                        <DataTable
                            type="bids"
                            columns={columns}
                            data={bidLimitOrders.slice(0, ordersShown)}
                            loading={loading}
                            toolbar={false}
                            peer={order.multiAddr}
                            pagination={false}
                            getRow={onClickRow}
                            options={{
                                sortOrder: {
                                    name: 'price',
                                    direction: 'asc',
                                },
                            }}
                            activeRow={activeIndex}
                        />
                    </Tab.Panel>
                    <Tab.Panel>
                        <DataTable
                            type="asks"
                            columns={columns}
                            data={askLimitOrders.slice(0, ordersShown)}
                            loading={loading}
                            toolbar={false}
                            peer={order.multiAddr}
                            pagination={false}
                            getRow={onClickRow}
                            options={{
                                sortOrder: {
                                    name: 'price',
                                    direction: 'desc',
                                },
                            }}
                            activeRow={activeIndex}
                        />
                    </Tab.Panel>
                </Card>
            </div>
        </div>
    );
};
