import { Transition } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers6';
import { toast } from 'react-toastify';
import {
    Button,
    Card,
    CopyClipboard,
    FullPageStatus,
    Input,
    ProgressIndicator,
} from '../components';
import { Dropdown } from '../components/dropdown';
import { useTrade } from '../hooks/trade';
import { useGlobalContext } from '../stores';
import { BASE_URL, truncate } from '../utils/common';
import { orderTokens, getDecimals, fromFormatted, toLimitOrder } from '../utils/orderbook';

export const FulfillView = () => {
    const { fulfillTrade, loading, trade, loadingTrade, steps, order, error } = useTrade();
    const { peer, setPeer, pintswap } = useGlobalContext();
    const [limitOrder, setLimitOrder] = useState({
        price: Number(0),
        amount: '',
        ticker: '',
        type: '',
    });
    const [outputAmount, setOutputAmount] = useState('');
    const [fillAmount, setFillAmount] = useState('');

    useEffect(() => {
        (async () => {
            if (pintswap.module) {
                const raw = await fromFormatted(trade, pintswap.module.signer);
                const {
                    pair: [base, tradeToken],
                } = orderTokens(raw);
                const decimals = await getDecimals(tradeToken.address, pintswap.module.signer);
                setFillAmount(ethers.formatUnits(tradeToken.amount, decimals));
                (setLimitOrder as any)(await toLimitOrder(raw as any, pintswap.module.signer));
            }
        })().catch((err) => console.error(err));
    }, [trade, pintswap.module]);
    useEffect(() => {
        const m = pintswap.module;
        if (m)
            (async () => {
                const raw = await fromFormatted(trade, m.signer);
                const {
                    pair: [base, tradeToken],
                } = orderTokens(raw);
                const [baseDecimals, tradeDecimals] = await Promise.all(
                    [base, tradeToken].map(async (v) => await getDecimals(v.address, m.signer)),
                );
                console.log(fillAmount);
                if (tradeToken.address === raw.givesToken) {
                    setOutputAmount(
                        Number(
                            ethers.formatUnits(
                                (ethers.toBigInt(ethers.parseUnits(fillAmount, tradeDecimals)) *
                                    ethers.toBigInt(raw.getsAmount)) /
                                    ethers.toBigInt(raw.givesAmount),
                                baseDecimals,
                            ),
                        ).toFixed(6),
                    );
                } else {
                    console.log(raw);
                    setOutputAmount(
                        Number(
                            ethers.formatUnits(
                                (ethers.toBigInt(ethers.parseUnits(fillAmount, baseDecimals)) *
                                    ethers.toBigInt(raw.givesAmount)) /
                                    ethers.toBigInt(raw.getsAmount),
                                baseDecimals,
                            ),
                        ).toFixed(6),
                    );
                }
            })().catch((err) => console.error(err));
    }, [pintswap.module, fillAmount, trade]);

    useEffect(() => {
        if (peer.module?.id || (peer.module as any)?._id) setPeer({ ...peer, loading: false });
    }, [peer.module]);

    return (
        <>
            {error && <FullPageStatus type="error" fx={() => toast.dismiss()} />}
            <div className="flex flex-col gap-6">
                <Card className="self-center" header="Fulfill Trade">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:gap-4">
                        <Dropdown
                            title="Pair"
                            placeholder="Pair"
                            state={limitOrder.ticker}
                            type="givesToken"
                            disabled
                            loading={loadingTrade}
                        />
                        <Input
                            title="Price"
                            placeholder="Price"
                            value={Number(limitOrder.price).toFixed(4)}
                            type="number"
                            disabled
                            loading={loadingTrade}
                        />
                        <Input
                            title="Amount"
                            placeholder="Amount to trade"
                            value={fillAmount}
                            type="number"
                            onChange={(evt: any) => {
                                evt.preventDefault();
                                setFillAmount(evt.target.value);
                            }}
                            loading={loadingTrade}
                        />
                        <Input
                            placeholder="Output amount"
                            value={outputAmount}
                            type="number"
                            disabled
                            loading={loadingTrade}
                        />
                    </div>
                    <Button
                        checkNetwork
                        className="mt-6 w-full"
                        loadingText="Fulfilling"
                        loading={loading && !error}
                        onClick={fulfillTrade}
                        disabled={
                            !trade.getsAmount ||
                            !trade.givesAmount ||
                            !trade.getsToken ||
                            !trade.givesToken ||
                            loadingTrade ||
                            loading
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
                <FullPageStatus type="success" />
            </Transition>
        </>
    );
};
