import { Tab, Transition } from '@headlessui/react';
import { PageStatus, TransitionModal, Card } from '../components';
import { Avatar, SwapModule } from '../features';
import { useTrade } from '../../hooks';
import { useAccount, useBalance, useNetwork } from 'wagmi';
import { useEffect } from 'react';
import { toAddress, updateToast } from '../../utils';
import { useNavigate } from 'react-router-dom';

export const FulfillView = () => {
    const { address } = useAccount();
    const navigate = useNavigate();
    const { chain } = useNetwork();
    const { fulfillTrade, loading, trade, steps, order, clearTrade } = useTrade();
    const { data } = useBalance(
        trade.gets.token?.toUpperCase() === 'ETH'
            ? { address }
            : { token: toAddress(trade.gets.token || '', chain?.id) as any, address, watch: true },
    );

    console.log(data);

    console.log(trade);

    const isButtonDisabled = () => {
        return (
            !trade.gets?.amount ||
            !trade.gives?.amount ||
            !trade.gets?.token ||
            !trade.gives?.token ||
            loading.trade ||
            loading.fulfill ||
            !address ||
            Number(data?.formatted) === 0
        );
    };

    const determineButtonText = () => {
        if (loading.trade || loading.fulfill) return 'Loading';
        if (
            !trade.gets?.amount ||
            !trade.gives?.amount ||
            !trade.gets?.token ||
            !trade.gives?.token
        )
            return 'Error loading trade';
        if (Number(data?.formatted) === 0) return `Insufficient ${trade.gets.token} balance`;
        return 'Fulfill';
    };

    useEffect(() => {
        if (steps[2].status === 'current') {
            updateToast('swapping', 'success');
            const timeout = setTimeout(() => {
                navigate('/');
            }, 5000);
            return () => clearTimeout(timeout);
        }
    }, [steps[2].status]);

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
                            buttonText={determineButtonText()}
                        />
                    </Tab.Panel>
                </Card>
            </div>
            {/* <Transition
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
            </Transition> */}
        </>
    );
};
