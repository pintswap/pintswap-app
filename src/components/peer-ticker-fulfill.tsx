import { Transition } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ethers } from 'ethers6';
import { Button, Card, CopyClipboard, PageStatus, Input, ProgressIndicator } from '.';
import { DropdownInput } from './dropdown-input';
import { useTrade } from '../hooks/trade';
import { useGlobalContext } from '../stores';
import { BASE_URL } from '../utils/common';
import { useAccount, useSigner } from 'wagmi';
import {
    toFormatted,
    toLimitOrder,
    getDecimals,
    formattedFromTransfer,
    fromFormatted,
    matchOffers,
} from '../utils/orderbook';

const ln = (v: any) => (console.log(v), v);
export const PeerTickerFulfill = ({
    tradeType,
    setTradeType,
    matchInputs,
    setMatchInputs,
}: any) => {
    const { address } = useAccount();
    const { data: signer } = useSigner();
    const { fulfillTrade, loading, trade, steps, order, error } = useTrade();
    const { peer, setPeer, pintswap } = useGlobalContext();
    const [limitOrder, setLimitOrder] = useState<any>({
        price: '',
        output: '',
    });
    const [fill, setFill] = useState<any>(null);
    const [getsDecimals, setGetsDecimals] = useState(18);
    useEffect(() => {
        (async () => {
            if (matchInputs.list.length)
                setGetsDecimals(await getDecimals(matchInputs.gets.token, signer));
        })().catch((err) => console.error(err));
    }, []);

    useEffect(() => {
        (async () => {
            if (!isNaN(Number(matchInputs.amount)) && matchInputs.list.length) {
                const match = matchOffers(matchInputs.list, matchInputs.amount);
                setFill({
                    ...match,
                    input: (
                        await toFormatted(
                            { amount: match.effective.gets, token: matchInputs.list[0].gets.token },
                            signer,
                        )
                    ).amount,
                    output: (
                        await toFormatted(
                            ln({
                                amount: match.effective.gives,
                                token: matchInputs.list[0].gives.token,
                            }),
                            signer,
                        )
                    ).amount,
                });
                setLimitOrder(
                    (await toLimitOrder(
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
                    )) as any,
                );
            }
        })().catch((err) => console.error(err));
    }, [matchInputs]);

    return (
        <>
            {error && <PageStatus type="error" fx={() => toast.dismiss()} />}
            <div className="flex flex-col gap-6">
                <Card header={'Fullfill Trade'}>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:gap-4">
                        <DropdownInput
                            title="Type"
                            placeholder="Trade Type"
                            state={tradeType}
                            type="string"
                            loading={loading.trade}
                            disabled={loading.allTrades}
                            options={['Buy', 'Sell']}
                            setState={(e: any) => {
                                console.log(e);
                                setTradeType(e);
                            }}
                        />
                        <Input
                            title="Price"
                            placeholder="Price"
                            value={Number(limitOrder.price).toFixed(4)}
                            type="number"
                            loading={loading.trade}
                            disabled={loading.allTrades}
                            onChange={(e) =>
                                setLimitOrder({ ...limitOrder, price: e.currentTarget.value })
                            }
                        />
                        <Input
                            title="Amount"
                            placeholder="Amount to trade"
                            value={(fill || {}).input || ''}
                            type="number"
                            loading={loading.trade}
                            disabled={loading.allTrades}
                            onChange={(e) => {
                                (async () => {
                                    console.log(e.target);
                                    console.log(e);
                                    setFill({
                                        input: e,
                                        ...fill,
                                    });
                                    setMatchInputs({
                                        amount: (
                                            await formattedFromTransfer(
                                                {
                                                    token:
                                                        (matchInputs.list[0] || {}).token ||
                                                        ethers.ZeroAddress,
                                                    amount: e,
                                                },
                                                signer,
                                            )
                                        ).amount,
                                        list: matchInputs.list,
                                    });
                                })().catch((err) => console.error(err));
                            }}
                        />
                        {/* TODO */}
                        <Input
                            title="Output"
                            placeholder="Output amount"
                            value={(fill || {}).output || ''}
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
                        Fulfill Trade
                    </Button>
                </Card>

                <div className="mx-auto">
                    <ProgressIndicator steps={steps} />
                </div>

                <Transition
                    show={!!order.orderHash && !!order.multiAddr}
                    enter="transition-opacity duration-75"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    className="flex flex-col justify-center items-center text-center"
                >
                    <p className="text-sm">Trade Link:</p>
                    <CopyClipboard
                        value={`${BASE_URL}/#/${order.multiAddr}/${order.orderHash}`}
                        icon
                        lg
                        truncate={5}
                    />
                </Transition>
            </div>
            <Transition
                show={steps[2].status === 'current'}
                enter="transition-opacity duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-150"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                className="flex flex-col justify-center items-center text-center"
            >
                <PageStatus type="success" />
            </Transition>
        </>
    );
};
