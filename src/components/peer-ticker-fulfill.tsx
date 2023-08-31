import { Transition } from '@headlessui/react';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { ethers } from 'ethers6';
import { Button, Card, CopyClipboard, PageStatus, Input, SwitchToggle, SmartPrice } from '.';
import { useTrade } from '../hooks/trade';
import { useAccount, useSigner } from 'wagmi';
import { BASE_URL, toLimitOrder, formattedFromTransfer, matchOffers, TESTING } from '../utils';
import { useParams } from 'react-router-dom';
import { isEqual } from 'lodash';
import { usePricesContext } from '../stores';

export const PeerTickerFulfill = ({
    tradeType,
    setTradeType,
    matchInputs,
    setMatchInputs,
}: any) => {
    const prices = usePricesContext();
    const { base: baseAsset, trade: tradeAsset } = useParams();
    const { address } = useAccount();
    const { data: signer } = useSigner();
    const { fulfillTrade, loading, trade, steps, order, error, fill, setFill } = useTrade();
    const [limitOrder, setLimitOrder] = useState<any>({
        price: '',
        output: '',
    });

    const handleAmountChange = async (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const input = (Number(e.target.value) < 0 ? '0' : e.target.value) || '0';
        setFill({
            input,
            ...fill,
        });
        const formattedAmount = (
            await formattedFromTransfer(
                {
                    token: ((matchInputs.list[0] || {}).gets || {}).token || ethers.ZeroAddress,
                    amount: input,
                },
                signer,
            )
        ).amount;
        const newMatchInputs = {
            amount: formattedAmount,
            list: matchInputs.list,
        };
        if (!isEqual(newMatchInputs, matchInputs)) setMatchInputs(newMatchInputs);
    };

    const inputAsset = useMemo(() => (tradeType === 'bids' ? tradeAsset : baseAsset), [tradeType]);
    const outputAsset = useMemo(() => (tradeType === 'bids' ? baseAsset : tradeAsset), [tradeType]);

    useEffect(() => {
        (async () => {
            if (!isNaN(Number(matchInputs.amount)) && matchInputs.list.length) {
                //                const decimals = await getDecimals(matchInputs.list[0].gives.token, signer);
                const match = matchOffers(matchInputs.list, matchInputs.amount);
                const limit = (await toLimitOrder(
                    {
                        gets: {
                            token: matchInputs.list[0].gets.token,
                            amount: match.effective.gets,
                        },
                        gives: {
                            token: matchInputs.list[0].gives.token,
                            amount: match.effective.gives,
                        },
                    },
                    signer,
                )) as any;
                if (TESTING)
                    console.log('tradeType:', tradeType, '\nmatch:', match, '\nlimit:', limit);
                if (tradeType === 'bids') {
                    const output = (Number(limit.amount) * Number(limit.price)).toFixed(4);
                    const newFill = {
                        ...match,
                        input: limit.amount,
                        output,
                    };
                    if (!isEqual(newFill, fill)) {
                        setFill(newFill);
                        setLimitOrder(limit);
                    }
                } else {
                    const input = (Number(limit.amount) * Number(limit.price)).toFixed(4);
                    const newFill = {
                        ...match,
                        output: limit.amount,
                        input,
                    };
                    if (!isEqual(newFill, fill)) {
                        setFill(newFill);
                        setLimitOrder(limit);
                    }
                }
            }
        })().catch((err) => console.error(err));
    }, [matchInputs]);

    console.log(prices);

    return (
        <>
            {error && <PageStatus type="error" fx={() => toast.dismiss()} />}
            <div className="flex flex-col gap-4 md:gap-6">
                <Card header={'Fullfill Trade'}>
                    <div className="flex flex-wrap gap-3">
                        <SwitchToggle
                            label="Trade Type"
                            labelOff="Sell"
                            labelOn="Buy"
                            state={tradeType === 'asks' ? false : true}
                            setState={() => {
                                if (tradeType === 'asks') setTradeType('bids');
                                else setTradeType('asks');
                            }}
                            disabled={loading.allTrades}
                        />
                        <Input
                            title={
                                <span className="flex justify-between items-end">
                                    <span>Price</span>
                                    <span className="text-indigo-600 opacity-80 text-xs">
                                        <SmartPrice price={Number(limitOrder.price).toString()} />{' '}
                                        ETH
                                    </span>
                                </span>
                            }
                            placeholder="Price"
                            value={(Number(limitOrder.price) * Number(prices.eth)).toString()}
                            type="smartDisplay"
                            loading={loading.trade}
                            disabled
                            onChange={(e) =>
                                setLimitOrder({
                                    ...limitOrder,
                                    price: e.currentTarget.value,
                                })
                            }
                        />
                        <Input
                            title={`Sending ${inputAsset}`}
                            placeholder="Input amount"
                            value={fill?.input}
                            type="number"
                            loading={loading.trade}
                            disabled={false}
                            onChange={handleAmountChange}
                        />
                        <Input
                            title={`Receiving ${outputAsset}`}
                            placeholder="Output amount"
                            value={fill?.output}
                            type="number"
                            disabled
                            loading={loading.trade}
                        />
                    </div>
                    <Button
                        checkNetwork
                        className="mt-6 w-full"
                        loadingText="Fulfilling"
                        loading={loading.fulfill && !error}
                        onClick={fulfillTrade}
                        disabled={
                            !trade.gets.amount ||
                            !trade.gives.amount ||
                            !trade.gets.token ||
                            !trade.gives.token ||
                            loading.trade ||
                            loading.fulfill ||
                            !address
                        }
                    >
                        Swap
                    </Button>
                </Card>

                <Transition
                    show={!!order.orderHash && !!order.multiAddr}
                    enter="transition-opacity duration-75"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    className="flex flex-col justify-center items-center text-center"
                >
                    <CopyClipboard
                        value={`${BASE_URL}/#/fulfill/${order.multiAddr}/${order.orderHash}`}
                        icon
                        lg
                        truncate={5}
                    >
                        Trade Link
                    </CopyClipboard>
                </Transition>
            </div>
            <Transition
                show={steps[2].status === 'current'}
                enter="transition-opacity duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                className="flex flex-col justify-center items-center text-center"
            >
                <PageStatus type="success" />
            </Transition>
        </>
    );
};
