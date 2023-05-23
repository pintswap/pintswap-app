import { Transition } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers6';
import { toast } from 'react-toastify';
import {
    Avatar,
    Button,
    Card,
    CopyClipboard,
    PageStatus,
    Input,
    ProgressIndicator,
    TransitionModal,
    Skeleton,
} from '../components';
import { DropdownInput } from '../components/dropdown-input';
import { useTrade } from '../hooks/trade';
import { usePintswapContext } from '../stores';
import { BASE_URL, parseTickerAsset } from '../utils/common';
import { orderTokens, getDecimals, fromFormatted, toLimitOrder } from '../utils/orderbook';
import { useAccount } from 'wagmi';
import { useLimitOrders } from '../hooks';
import { useParams } from 'react-router-dom';

export const FulfillView = () => {
    const { address } = useAccount()
    const { fulfillTrade, loading, trade, steps, order, error } = useTrade();
    const { pintswap } = usePintswapContext();
    const { limitOrders  } = useLimitOrders('peer-orderbook');
    const { hash, multiaddr } = useParams();

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
                const foundLimitOrder = limitOrders.find(order => order?.hash === hash);
                if(foundLimitOrder) {
                    console.log("LIMIT ORDER EXISTING", foundLimitOrder);
                    setLimitOrder(foundLimitOrder);
                    setFillAmount(foundLimitOrder?.amount || '')
                } else {
                    const raw = await fromFormatted(trade, pintswap.module.signer);
                    const {
                        pair: [base, tradeToken],
                    } = orderTokens(raw);
                    const decimals = await getDecimals(tradeToken.address, pintswap.module.signer);
                    setFillAmount(ethers.formatUnits(tradeToken.amount, decimals));
                    const limitOrderRes = await toLimitOrder(raw as any, pintswap.module.signer);
                    console.log("LIMIT ORDER NEW", limitOrderRes);
                    setLimitOrder(limitOrderRes as any);
                }
            }
        })().catch((err) => console.error(err));
    }, [trade, pintswap.module, hash, multiaddr, limitOrders]);

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
                if (tradeToken.address === raw.gives.token) {
                    setOutputAmount(
                        Number(
                            ethers.formatUnits(
                                (ethers.toBigInt(ethers.parseUnits(fillAmount, tradeDecimals)) *
                                    ethers.toBigInt(raw.gets.amount)) /
                                    ethers.toBigInt(raw.gives.amount),
                                baseDecimals,
                            ),
                        ).toFixed(6),
                    );
                } else {
                    setOutputAmount(
                        Number(
                            ethers.formatUnits(
                                (ethers.toBigInt(ethers.parseUnits(fillAmount, baseDecimals)) *
                                    ethers.toBigInt(raw.gives.amount)) /
                                    ethers.toBigInt(raw.gets.amount),
                                baseDecimals,
                            ),
                        ).toFixed(6),
                    );
                }
            })().catch((err) => console.error(err));
    }, [pintswap.module, fillAmount, trade]);

    return (
        <>
            {error && <PageStatus type="error" fx={() => toast.dismiss()} />}
            <div className="flex flex-col gap-6">
            <TransitionModal button={<Avatar peer={order.multiAddr} withBio withName align="left" size={60} type="profile" />}>
                    <Avatar peer={order.multiAddr} size={300} />
                </TransitionModal>
                <Card 
                    header={
                        <div>
                            <span>Fullfill Trade</span>
                            <div className="flex justify-center">
                                <Skeleton loading={loading.trade}>
                                    <div className={`text-sm font-extralight flex items-center gap-2 justify-center ${loading.trade ? 'text-neutral-700' : 'text-gray-400'}`}>
                                        <span>Sending {parseTickerAsset(limitOrder.ticker, 2)}</span>
                                        <span>&</span>
                                        <span>Receiving {parseTickerAsset(limitOrder.ticker, 1)}</span>
                                    </div>
                                </Skeleton>
                            </div>
                        </div>
                    }
                    className=''
                >
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:gap-4">
                        <DropdownInput
                            title={`Pair (Sending ${parseTickerAsset(limitOrder.ticker, 1)})`}
                            placeholder="Pair"
                            state={limitOrder.ticker}
                            type="gives.token"
                            disabled
                            loading={loading.trade}
                        />
                        <Input
                            title="Price"
                            placeholder="Price"
                            value={Number(limitOrder.price).toFixed(4)}
                            type="number"
                            disabled
                            loading={loading.trade}
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
                            loading={loading.trade}
                        />
                        <Input
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
                        loading={(loading.fulfill || loading.trade) && !error}
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
