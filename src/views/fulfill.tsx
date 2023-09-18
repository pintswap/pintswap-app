import { Transition } from '@headlessui/react';
import { Avatar, PageStatus, TransitionModal, SwapModule, Card } from '../components';
import { useTrade } from '../hooks/trade';
import { useAccount } from 'wagmi';

export const FulfillView = () => {
    const { address } = useAccount();
    const { fulfillTrade, loading, trade, steps, order } = useTrade();

    const isButtonDisabled = () => {
        return (
            !trade.gets?.amount ||
            !trade.gives?.amount ||
            !trade.gets?.token ||
            !trade.gives?.token ||
            loading.trade ||
            loading.fulfill ||
            !address
        );
    };

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
                <Card className="!py-4">
                    <div>
                        <span className="text-xl">Fulfill</span>
                    </div>
                    <SwapModule
                        type="fulfill"
                        trade={{
                            gets: trade.gives,
                            gives: trade.gets,
                        }}
                        disabled={isButtonDisabled()}
                        onClick={fulfillTrade}
                        loading={loading}
                    />
                </Card>
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
