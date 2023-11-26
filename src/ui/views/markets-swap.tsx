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
import {
    EMPTY_TRADE,
    IOfferProps,
    displayOffer,
    getNextHighestIndex,
    reverseOffer,
    toAddress,
    truncate,
} from '../../utils';
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
    const { setOrder, trade, setTrade, fulfillTrade, loading, steps, updateTrade, setFill, fill } =
        useTrade();
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
    }, [offersByChain.erc20.length]);

    const onClickRow = async (row: any) => {
        const [tradeType, price, amount, sum] = row;
        // const { index } = row;
        const found = peerOffers[isBuy ? 'asks' : 'bids'].find(
            (el) => el.amount === amount && el.price === price,
        );
        if (found) {
            setOrder({ multiAddr: found.peer, orderHash: found.hash });
            const displayedOffer = await displayOffer(found.raw);
            setFill(displayedOffer.gets.amount);
            setDisplayedTrade(reverseOffer(displayedOffer));
            setTrade(found.raw);
        }
    };

    const renderEmptyTrade = () => {
        setFill('');
        if (!isBuy && peerOffers?.bids.length) {
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

    useEffect(() => {
        if (
            trade?.gets?.amount === '' &&
            trade?.gives?.amount === '' &&
            displayedTrade?.gets.amount !== '' &&
            displayedTrade?.gives.amount !== ''
        ) {
            // Set empty
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
    }, [trade?.gets?.amount, trade?.gives?.amount]);

    useEffect(() => {
        renderEmptyTrade();
    }, [isBuy]);

    useEffect(() => {
        if (steps[2].status === 'current' && !trade?.gives.amount && !trade?.gets.amount) {
            renderEmptyTrade();
        }
    }, [steps[2].status]);

    useEffect(() => {
        // Find best price for fill/give amount
        if (peerOffers && fill) {
            (async () => {
                const maxOffer = isBuy ? peerOffers?.maxAsk : peerOffers?.maxBid;
                if (maxOffer && fill === maxOffer[isBuy ? 'baseAmount' : 'amount']) {
                    setTrade(maxOffer.raw);
                    setOrder({ multiAddr: maxOffer.peer, orderHash: maxOffer.hash });
                    const displayedOffer = await displayOffer(maxOffer.raw);
                    setDisplayedTrade(reverseOffer(displayedOffer));
                } else {
                    let list: IOfferProps[] = [];
                    if (isBuy) list = peerOffers.asks;
                    else list = peerOffers.bids;
                    if (!list.length) return;
                    const bestIndex = getNextHighestIndex(
                        list.map((o) => Number(o.amount)).sort((a, b) => a - b),
                        Number(fill),
                    );
                    if (
                        list[bestIndex] &&
                        trade?.gets?.amount !== list[bestIndex]?.raw?.gets?.amount
                    ) {
                        console.log('next highest offer', list[bestIndex]);
                        setTrade(list[bestIndex]?.raw);
                        setOrder({
                            multiAddr: list[bestIndex]?.peer,
                            orderHash: list[bestIndex]?.hash,
                        });
                        const displayedOffer = await displayOffer(list[bestIndex]?.raw);
                        setDisplayedTrade(reverseOffer(displayedOffer));
                    }
                    console.log('next highest index', bestIndex);
                }
                console.log('fill', fill);
            })().catch((err) => console.error(err));
        }
    }, [fill]);

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
                    <Card className="lg:max-w-lg h-fit">
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
                            max={
                                (isBuy
                                    ? peerOffers?.maxAsk?.baseAmount
                                    : peerOffers?.maxBid?.amount) || '-'
                            }
                            raw={trade}
                            fill={fill}
                            setFill={setFill}
                            type="fulfill"
                            onClick={fulfillTrade}
                            loading={loading}
                            disabled={isLoading || loading.fulfill || !trade?.gets.amount}
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
                        className="h-fit"
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
