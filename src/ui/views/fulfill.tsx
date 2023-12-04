import { Tab } from '@headlessui/react';
import { TransitionModal, Card } from '../components';
import { Avatar, SwapModule } from '../features';
import { useOtcTrade, useTrade } from '../../hooks';
import { useAccount, useBalance, useNetwork } from 'wagmi';
import { useEffect } from 'react';
import { DEFAULT_TIMEOUT, reverseOffer, toAddress, renderToast, wait } from '../../utils';
import { useNavigate } from 'react-router-dom';

export const FulfillView = () => {
    const { address } = useAccount();
    const navigate = useNavigate();
    const { chain } = useNetwork();
    const { loadingTrade, trade: otcTrade, executeTrade, fillingTrade } = useOtcTrade();
    const { fulfillTrade, loading, trade, steps, order, clearTrade } = useTrade(true);
    const { data } = useBalance(
        trade.gets.token?.toUpperCase() === 'ETH'
            ? { address }
            : { token: toAddress(trade.gets.token || '', chain?.id) as any, address, watch: true },
    );

    const isButtonDisabled = () => {
        return (
            !trade.gets?.amount ||
            !trade.gives?.amount ||
            !trade.gets?.token ||
            !trade.gives?.token ||
            loading.fulfill ||
            !address ||
            Number(data?.formatted) === 0
        );
    };

    const determineButtonText = () => {
        if (!trade.gets.token && !trade.gives.token) return 'Loading';
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
            renderToast('swapping', 'success');
            const timeout = setTimeout(() => navigate('/'), DEFAULT_TIMEOUT * 2);
            return () => clearTimeout(timeout);
        }
    }, [steps[2].status]);

    return (
        <>
            <div className="flex flex-col gap-3 2xl:gap-4 max-w-lg mx-auto">
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
                            trade={reverseOffer(trade)}
                            disabled={isButtonDisabled()}
                            onClick={fulfillTrade}
                            loading={{
                                trade: !trade.gets.token && !trade.gives.token,
                                fulfill: loading.fulfill,
                            }}
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
