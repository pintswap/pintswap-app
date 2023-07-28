import { Transition } from '@headlessui/react';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { ethers } from 'ethers6';
import { Button, Card, CopyClipboard, PageStatus, Input, ProgressIndicator } from '.';
import { DropdownInput } from './dropdown-input';
import { useTrade } from '../hooks/trade';
import { useAccount, useSigner } from 'wagmi';
import { BASE_URL, toLimitOrder, formattedFromTransfer, matchOffers } from '../utils';
import { useParams } from 'react-router-dom';
import { isEqual } from 'lodash';

let lastFill: any;

export const PeerTickerFulfill = ({
    tradeType,
    setTradeType,
    matchInputs,
    setMatchInputs,
}: any) => {
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
                    token: (matchInputs.list[0] || {}).token || ethers.ZeroAddress,
                    amount: input,
                },
                signer,
            )
        ).amount;
        const newMatchInputs = {
            amount: formattedAmount,
            list: matchInputs.list,
        };
        console.log('newMatchInputs, matchInputs', [newMatchInputs, matchInputs]);
        if (!isEqual(newMatchInputs, matchInputs)) setMatchInputs(newMatchInputs);
    };

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
            }
        })().catch((err) => console.error(err));
    }, [matchInputs]);
    const options = useMemo(() => {
        return [`Buy ${tradeAsset ? tradeAsset : ''}`, `Sell ${tradeAsset ? tradeAsset : ''}`];
    }, [tradeAsset]);
    const tradeTypeOption = useMemo(
        () => (tradeType === 'asks' ? options[0] : options[1]),
        [options, tradeType],
    );

    const inputAmount = useMemo(
        () => (tradeType === 'bids' ? (fill || {}).input : (fill || {}).output) || '',
        [tradeType, fill],
    );
    const inputAsset = useMemo(() => (tradeType === 'bids' ? tradeAsset : baseAsset), [tradeType]);
    const outputAsset = useMemo(() => (tradeType === 'bids' ? baseAsset : tradeAsset), [tradeType]);
    const outputAmount = useMemo(
        () => (tradeType === 'bids' ? (fill || {}).output : (fill || {}).input) || '',
        [tradeType, fill],
    );

    return (
        <>
            {error && <PageStatus type="error" fx={() => toast.dismiss()} />}
            <div className="flex flex-col gap-4 md:gap-6">
                <Card header={'Fullfill Trade'}>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:gap-4">
                        <DropdownInput
                            title="Type"
                            placeholder="Trade Type"
                            state={tradeTypeOption}
                            type="string"
                            loading={loading.trade}
                            disabled={loading.allTrades}
                            options={options}
                            setState={(e: any) => {
                                setTradeType(e.match('Buy') ? 'asks' : 'bids');
                            }}
                        />
                        <Input
                            title="Price"
                            placeholder="Price"
                            value={Number(limitOrder.price).toFixed(16)}
                            type="number"
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
                            title={`Input ${inputAsset}`}
                            placeholder="Input amount"
                            value={inputAmount}
                            type="number"
                            loading={loading.trade}
                            onChange={handleAmountChange}
                        />
                        <Input
                            title={`Output ${outputAsset}`}
                            placeholder="Output amount"
                            value={outputAmount}
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
