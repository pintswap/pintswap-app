import { Tab, Transition } from '@headlessui/react';
import { PageStatus, TransitionModal, Card } from '../components';
import { Avatar, SwapModule } from '../features';
import { useTrade } from '../../hooks';
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
            <div className="flex flex-col gap-4 md:gap-6 max-w-lg mx-auto">
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
                <Card className="!py-4" type="tabs" tabs={['Fulfill']}>
                    <Tab.Panel>
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
                    </Tab.Panel>
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
