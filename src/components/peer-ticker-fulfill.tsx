import { Transition } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import {
    Button,
    Card,
    CopyClipboard,
    PageStatus,
    Input,
    ProgressIndicator,
} from '.';
import { DropdownInput } from './dropdown-input';
import { useTrade } from '../hooks/trade';
import { useGlobalContext } from '../stores';
import { BASE_URL } from '../utils/common';
import { useAccount } from 'wagmi';

export const PeerTickerFulfill = ({
  forTicker,
  input,
}: any) => {
    const [ tradeType, price, size, sum ] = input;
    const { address } = useAccount()
    const { fulfillTrade, loading, trade, steps, order, error } = useTrade();
    const { peer, setPeer, pintswap } = useGlobalContext();
    const [ limitOrder, setLimitOrder ] = useState({
      price,
      amount: size,
      type: tradeType,
      output: ''
    });

    useEffect(() => {
        if(input) {
            setLimitOrder({
                price,
                amount: size,
                type: tradeType,
                output: ''
            })
        }
    }, [input]);

    return (
        <>
            {error && <PageStatus type="error" fx={() => toast.dismiss()} />}
            <div className="flex flex-col gap-6">
                <Card 
                header={"Fullfill Trade"}
                >
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:gap-4">
                        <DropdownInput
                            title="Type"
                            placeholder="Trade type"
                            state={limitOrder.type}
                            type="string"
                            loading={loading.trade}
                            disabled={loading.allTrades}
                            options={["bids", "asks"]}
                            setState={(e: any) => setLimitOrder({ ...limitOrder, type: e.currentTarget.value })}
                        />
                        <Input
                            title="Price"
                            placeholder="Price"
                            value={Number(limitOrder.price).toFixed(4)}
                            type="number"
                            loading={loading.trade}
                            disabled={loading.allTrades}
                            onChange={(e) => setLimitOrder({ ...limitOrder, price: e.currentTarget.value })}
                        />
                        <Input
                            title="Amount"
                            placeholder="Amount to trade"
                            value={limitOrder.amount}
                            type="number"
                            loading={loading.trade}
                            disabled={loading.allTrades}
                            onChange={(e) => setLimitOrder({ ...limitOrder, amount: e.currentTarget.value })}
                        />
                        {/* TODO */}
                        <Input
                            title="Output"
                            placeholder="Output amount"
                            value={limitOrder.output}
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
