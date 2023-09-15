import { Transition } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { Avatar, PageStatus, TransitionModal, SwapModule } from '../components';
import { useTrade } from '../hooks/trade';
import { usePintswapContext } from '../stores';
import { orderTokens, fromFormatted, toLimitOrder, parseTickerAsset } from '../utils';
import { useAccount } from 'wagmi';
import { useLimitOrders } from '../hooks';
import { useParams } from 'react-router-dom';

export const FulfillView = () => {
    const { address } = useAccount();
    const { fulfillTrade, loading, trade, steps, order } = useTrade();
    const {
        pintswap: { module, chainId },
    } = usePintswapContext();
    const { limitOrders } = useLimitOrders('peer-orderbook');
    const { hash, multiaddr } = useParams();

    const [limitOrder, setLimitOrder] = useState({
        price: Number(0),
        amount: '',
        ticker: '',
        type: '',
    });

    const isButtonDisabled = () => {
        return (
            !trade.gets.amount ||
            !trade.gives.amount ||
            !trade.gets.token ||
            !trade.gives.token ||
            loading.trade ||
            loading.fulfill ||
            !address
        );
    };

    useEffect(() => {
        (async () => {
            if (module) {
                const foundLimitOrder = limitOrders.find((order) => order?.hash === hash);
                if (foundLimitOrder) {
                    setLimitOrder(foundLimitOrder);
                } else {
                    if (!trade.gets?.token && !trade.gives?.token) return;
                    const raw = await fromFormatted(trade, chainId);
                    const {
                        pair: [base, tradeToken],
                    } = orderTokens(raw, chainId);
                    const limitOrderRes = await toLimitOrder(raw as any, chainId);
                    setLimitOrder(limitOrderRes as any);
                }
            }
        })().catch((err) => console.error(err));
    }, [trade, module, hash, multiaddr, limitOrders]);

    const sendAsset = parseTickerAsset(limitOrder.ticker, 2);
    const sendAmount = String(limitOrder.price);
    const receiveAsset = parseTickerAsset(limitOrder.ticker, 1);
    const receiveAmount = limitOrder.amount;

    return (
        <>
            <div className="flex flex-col gap-4 md:gap-6 max-w-xl mx-auto">
                <div className="flex items-center justify-between">
                    <TransitionModal
                        button={
                            <Avatar
                                peer={order.multiAddr}
                                withBio
                                withName
                                align="left"
                                size={60}
                                type="profile"
                            />
                        }
                    >
                        <Avatar peer={order.multiAddr} size={300} />
                    </TransitionModal>
                </div>
                <SwapModule
                    header="Fulfill"
                    type="fulfill"
                    trade={{
                        gets: {
                            token: receiveAsset,
                            amount: receiveAmount,
                        },
                        gives: {
                            token: sendAsset,
                            amount: sendAmount,
                        },
                    }}
                    disabled={isButtonDisabled()}
                    onClick={fulfillTrade}
                    loading={loading}
                />
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
