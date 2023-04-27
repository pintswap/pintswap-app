import { Transition } from '@headlessui/react';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { ethers } from 'ethers6';
import { Button, Card, CopyClipboard, PageStatus, Input, ProgressIndicator } from '.';
import { DropdownInput } from './dropdown-input';
import { useTrade } from '../hooks/trade';
import { BASE_URL } from '../utils/common';
import { useAccount, useSigner } from 'wagmi';
import {
    toLimitOrder,
    formattedFromTransfer,
    matchOffers,
} from '../utils/orderbook';

export const PeerTickerFulfill = ({
    tradeType,
    setTradeType,
    matchInputs,
    setMatchInputs,
}: any) => {
    const { address } = useAccount();
    const { data: signer } = useSigner();
    const { fulfillTrade, loading, trade, steps, order, error, fill, setFill } = useTrade();
    const [limitOrder, setLimitOrder] = useState<any>({
        price: '',
        output: '',
    });

    const handleAmountChange = async (e: FormEvent<HTMLInputElement>) => {
        const formattedAmount = (await formattedFromTransfer({
                token:
                    (matchInputs.list[0] || {}).token ||
                    ethers.ZeroAddress,
                amount: e,
            }, signer)).amount
        setFill({
            input: e.currentTarget.value,
            ...fill,
        });
        setMatchInputs({
            amount: formattedAmount,
            list: matchInputs.list,
        });
    }

    useEffect(() => {
        (async () => {
            if (!isNaN(Number(matchInputs.amount)) && matchInputs.list.length) {
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
                setFill({
                    ...match,
                    input: limit.amount,
                    output: (Number(limit.amount) * Number(limit.price)).toFixed(4),
                });
                setLimitOrder(limit);
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
                            setState={(e: any) => setTradeType(e)}
                        />
                        <Input
                            title="Price"
                            placeholder="Price"
                            value={Number(limitOrder.price).toFixed(4)}
                            type="number"
                            loading={loading.trade}
                            disabled={loading.allTrades}
                            onChange={(e) => setLimitOrder({ 
                                ...limitOrder, 
                                price: e.currentTarget.value 
                            })}
                        />
                        <Input
                            title="Amount"
                            placeholder="Amount to trade"
                            value={(fill || {}).input || ''}
                            type="number"
                            loading={loading.trade}
                            disabled={loading.allTrades}
                            onChange={handleAmountChange}
                        />
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
