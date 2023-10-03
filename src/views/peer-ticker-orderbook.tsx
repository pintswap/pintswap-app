import {
    Avatar,
    DataTable,
    PeerTickerFulfill,
    Card,
    Asset,
    Header,
    TooltipWrapper,
} from '../components';
import { useTrade } from '../hooks/trade';
import { useLocation, useParams } from 'react-router-dom';
import { useLimitOrders, useWindowSize } from '../hooks';
import { ethers } from 'ethers6';
import { useEffect, useState } from 'react';
import { Tab } from '@headlessui/react';
import { NETWORKS } from '../utils';
import { usePintswapContext } from '../stores';

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
    const { width, breakpoints } = useWindowSize();
    const {
        pintswap: { chainId },
    } = usePintswapContext();
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

    const determineTokenAddresses = () => {
        if (matchInputs?.list?.length) {
            const anyTrade = matchInputs.list[0];
            if (tradeType === 'asks') {
                // Buy
                return {
                    quote: anyTrade?.gives?.token || '',
                    base: anyTrade?.gets?.token || '',
                };
            } else {
                // Sell
                return {
                    quote: anyTrade?.gets?.token || '',
                    base: anyTrade?.gives?.token || '',
                };
            }
        }
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
        <div className="flex flex-col">
            <div className="grid grid-cols-2 lg:grid-cols-3 items-center justify-between mb-4 md:mb-6">
                <Header
                    breadcrumbs={[
                        { text: 'Markets', link: '/markets' },
                        {
                            text: `${ticker.replace('/', '-').toUpperCase()}`,
                            link: `/markets/${ticker.replace('/', '-')}`,
                        },
                        { text: `${peer}`, link: `/${peer}` },
                    ]}
                >
                    Peer Orderbook
                </Header>

                {width > breakpoints.lg && (
                    <a className="justify-self-center" href={`/${peer}`}>
                        <Avatar peer={multiaddr} nameClass="text-xl" type="clickable" />
                    </a>
                )}

                <div className="justify-self-end hidden sm:block">
                    <span className="text-sm md:text-md xl:text-lg">
                        <span className="flex sm:flex-col sm:justify-end text-left">
                            <TooltipWrapper
                                id={`${ticker?.split('/')[0]}-address`}
                                text={determineTokenAddresses()?.quote}
                                position="left"
                            >
                                <a
                                    href={`${NETWORKS[chainId].explorer}/token/${
                                        determineTokenAddresses()?.quote
                                    }`}
                                    rel="noreferrer"
                                    className="transition duration-100 hover:underline"
                                    target="_blank"
                                >
                                    <Asset
                                        fontSize="text-[15px]"
                                        symbol={ticker?.split('/')[0]}
                                        size={16}
                                    />
                                </a>
                            </TooltipWrapper>
                            <hr className="border opacity-25 my-1 2xl:my-1.5" />
                            <TooltipWrapper
                                id={`${ticker?.split('/')[1]}-address`}
                                text={determineTokenAddresses()?.base}
                                position="left"
                            >
                                <a
                                    href={`${NETWORKS[chainId].explorer}/token/${
                                        determineTokenAddresses()?.base
                                    }`}
                                    rel="noreferrer"
                                    className="transition duration-100 hover:underline"
                                    target="_blank"
                                >
                                    <Asset
                                        fontSize="text-[15px]"
                                        symbol={ticker?.split('/')[1]}
                                        size={16}
                                    />
                                </a>
                            </TooltipWrapper>
                        </span>
                    </span>
                </div>
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
