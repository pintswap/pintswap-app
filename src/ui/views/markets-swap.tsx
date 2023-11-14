import {
    Card,
    Header,
    SwitchToggle,
    TransitionModal,
    TextDisplay,
    SmartPrice,
} from '../components';
import { DataTable } from '../tables';
import { Avatar, SwapModule } from '../features';
import { useTrade, useUsdPrice } from '../../hooks';
import { useLocation, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { Tab } from '@headlessui/react';
import { EMPTY_TRADE, toAddress, truncate } from '../../utils';
import { useOffersContext } from '../../stores';
import { IOffer } from '@pintswap/sdk';

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
        label: 'Quantity',
        options: {
            filter: false,
            sort: true,
            sortThirdClickReset: true,
        },
    },
    {
        name: 'priceUsd',
        label: 'Total',
        options: {
            filter: false,
            sort: true,
            sortThirdClickReset: true,
        },
    },
];

export const MarketsSwapView = () => {
    const { pathname } = useLocation();
    const { offersByChain, isLoading } = useOffersContext();
    const { pair, multiaddr } = useParams();
    const quote = pair?.split('-')[0] || '';
    const base = pair?.split('-')[1] || '';
    const { setOrder, trade, setTrade, displayTradeObj, fulfillTrade, loading, steps } = useTrade();
    const [isBuy, setIsBuy] = useState(true);
    const [displayedTrade, setDisplayedTrade] = useState<IOffer>(EMPTY_TRADE);
    const usdPrice = useUsdPrice(toAddress(quote));

    const peerOffers = useMemo(() => {
        let offers = offersByChain.erc20.filter(
            (el) => el.ticker.toLowerCase() === `${quote?.toLowerCase()}/${base?.toLowerCase()}`,
        );
        if (multiaddr) offers = offers.filter((el) => el.peer === multiaddr);
        const bids = offers.filter((el) => el.type === 'bid');
        const asks = offers.filter((el) => el.type === 'ask');
        return {
            bids,
            asks,
            maxBid: bids.length
                ? bids.reduce((prev, curr) =>
                      Number(prev.amount) > Number(curr.amount) ? prev : curr,
                  )
                : undefined,
            maxAsk: asks.length
                ? asks.reduce((prev, curr) =>
                      Number(prev.amount) > Number(curr.amount) ? prev : curr,
                  )
                : undefined,
        };
    }, [offersByChain.erc20]);

    const onClickRow = async (row: any) => {
        const [tradeType, price, amount, sum] = row;
        // const { index } = row;
        const found = peerOffers[isBuy ? 'asks' : 'bids'].find(
            (el) => el.amount === amount && el.price === price,
        );
        if (found) {
            setOrder({ multiAddr: found.peer, orderHash: found.hash });
            const displayOffer = await displayTradeObj(found.raw);
            const correctSide = { gives: displayOffer.gets, gets: displayOffer.gives };
            setDisplayedTrade(correctSide);
            setTrade(found.raw);
        }
    };

    const renderBreadcrumbs = () => {
        if (multiaddr) {
            return [
                { text: 'Peers', link: '/peers' },
                {
                    text: `${truncate(pathname.split('/')[2])}`,
                    link: `/peers/${pathname.split('/')[2]}`,
                },
                {
                    text: `${pair?.toUpperCase()}`,
                    link: `/peers/${pathname.split('/')[2]}/${pair}`,
                },
            ];
        }
        return [
            { text: 'Markets', link: '/markets' },
            {
                text: `${pathname.split('/')[2]?.toUpperCase()}`,
                link: `/markets/${pathname.split('/')[2]}`,
            },
        ];
    };

    const renderEmptyTrade = () => {
        if (!isBuy && peerOffers.bids.length) {
            setDisplayedTrade({
                gives: {
                    token: quote,
                    amount: '',
                },
                gets: {
                    token: base,
                    amount: '',
                },
            });
        } else {
            setDisplayedTrade({
                gives: {
                    token: base,
                    amount: '',
                },
                gets: {
                    token: quote,
                    amount: '',
                },
            });
        }
    };

    useEffect(() => {
        if (quote && base && trade.gets.token === '') {
            (async () => {
                const found = peerOffers.asks[0];
                if (found) {
                    setOrder({ multiAddr: found?.peer, orderHash: found.hash });
                    const displayOffer = await displayTradeObj(found.raw);
                    const correctSide = { gives: displayOffer.gets, gets: displayOffer.gives };
                    setDisplayedTrade(correctSide);
                    setTrade(found.raw);
                }
            })().catch((err) => console.error(err));
        }
    }, [offersByChain.erc20.length]);

    useEffect(() => {
        if (
            trade.gets.amount === '' &&
            trade.gives.amount === '' &&
            displayedTrade.gets.amount !== '' &&
            displayedTrade.gives.amount !== ''
        ) {
            setDisplayedTrade({
                gives: {
                    token: base,
                    amount: '',
                },
                gets: {
                    token: quote,
                    amount: '',
                },
            });
        }
    }, [trade.gets.amount, trade.gives.amount]);

    useEffect(() => {
        renderEmptyTrade();
    }, [isBuy]);

    useEffect(() => {
        if (steps[2].status === 'current' && !trade.gives.amount && !trade.gets.amount) {
            renderEmptyTrade();
        }
    }, [steps[2].status]);

    return (
        <>
            <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2.5 lg:mb-3">
                    <Header breadcrumbs={renderBreadcrumbs()}>
                        {multiaddr ? 'Peer Orderbook' : 'Market Swap'}
                    </Header>
                    {multiaddr ? (
                        <div className="justify-self-end hidden sm:block">
                            <TransitionModal
                                button={
                                    <Avatar
                                        peer={multiaddr}
                                        nameClass="text-xl"
                                        type="profile"
                                        align="left"
                                    />
                                }
                            >
                                <Avatar peer={multiaddr} size={300} />
                            </TransitionModal>
                        </div>
                    ) : (
                        <TextDisplay
                            loading={usdPrice === '-'}
                            value={
                                <span className="flex items-center gap-1">
                                    <span className="text-sm">$</span>{' '}
                                    <SmartPrice price={usdPrice} />
                                </span>
                            }
                            label="Market Price"
                            align="right"
                        />
                    )}
                </div>
                <div className="flex flex-col lg:flex-row gap-2 md:gap-3 lg:gap-4">
                    <Card className="lg:max-w-lg">
                        <h2 className="mb-3 font-semibold">Swap</h2>
                        <div className="mb-3">
                            <SwitchToggle
                                labelOn="Buy"
                                labelOff="Sell"
                                state={!isBuy}
                                setState={() => setIsBuy(!isBuy)}
                            />
                        </div>
                        <SwapModule
                            trade={displayedTrade}
                            raw={trade}
                            type="fulfill"
                            onClick={fulfillTrade}
                            loading={loading}
                            disabled={isLoading || loading.fulfill || !trade.gets.amount}
                            percentDiff // TODO: not working
                            // max={peerOffers()[isBuy ? 'maxAsk' : 'maxBid'].amount}
                        />
                    </Card>
                    <Card
                        tabs={['Bids', 'Asks']}
                        type="tabs"
                        defaultTab={isBuy ? 'asks' : 'bids'}
                        selectedTab={isBuy ? 'asks' : 'bids'}
                        onTabChange={() => setIsBuy(!isBuy)}
                    >
                        <Tab.Panel>
                            <DataTable
                                type="bids"
                                columns={columns}
                                data={peerOffers.bids}
                                loading={isLoading}
                                toolbar={false}
                                pagination={true}
                                getRow={onClickRow}
                                options={{
                                    sortOrder: {
                                        name: 'price',
                                        direction: 'desc',
                                    },
                                }}
                                // activeRow={activeIndex}
                            />
                        </Tab.Panel>
                        <Tab.Panel>
                            <DataTable
                                type="asks"
                                columns={columns}
                                data={peerOffers.asks}
                                loading={isLoading}
                                toolbar={false}
                                getRow={onClickRow}
                                pagination={true}
                                options={{
                                    sortOrder: {
                                        name: 'price',
                                        direction: 'asc',
                                    },
                                }}
                                // activeRow={activeIndex}
                            />
                        </Tab.Panel>
                    </Card>
                </div>
            </div>
        </>
    );
};
