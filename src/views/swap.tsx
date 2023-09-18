import {
    Button,
    Card,
    CopyClipboard,
    Input,
    PageStatus,
    SwapModule,
    SwitchToggle,
    TransitionModal,
} from '../components';
import { useTrade } from '../hooks';
import React, { useEffect, useState } from 'react';
import { BASE_URL } from '../utils';
import { usePintswapContext } from '../stores';
import { MdClose } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { Tab, Transition } from '@headlessui/react';

export const SwapView = () => {
    const navigate = useNavigate();
    const {
        pintswap: { module, chainId },
    } = usePintswapContext();
    const {
        loading,
        trade,
        broadcastTrade,
        updateTrade,
        isButtonDisabled,
        clearTrade,
        order,
        steps,
        setTrade,
    } = useTrade();
    const [isPublic, setIsPublic] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [resolvedName, setResolvedName] = useState(module?.peerId?.toB58String());

    const handleSwap = async (e: React.SyntheticEvent) => {
        await broadcastTrade(e, isPublic);
        setIsModalOpen(true);
    };

    const handleModalClose = (e: any) => {
        clearTrade();
        setIsModalOpen(false);
    };

    const createTradeLink = () => {
        let finalUrl = `${BASE_URL}/#/fulfill/${resolvedName}`;
        if (trade.gives.tokenId) {
            finalUrl = `${finalUrl}/nft/${order.orderHash}`;
        } else {
            finalUrl = `${finalUrl}/${order.orderHash}`;
        }
        return `${finalUrl}/${chainId}`;
    };

    useEffect(() => {
        (async () => {
            setResolvedName(order.multiAddr);
            if (module) {
                try {
                    const dripName = await module.resolveName(module.peerId.toB58String());
                    setResolvedName(dripName);
                } catch (e) {
                    module && module.logger.error(e);
                }
            }
        })().catch((err) => (module && module.logger.error(err)) || console.error(err));
    }, [order]);

    return (
        <>
            <div className="flex flex-col max-w-xl mx-auto">
                <h2 className="view-header text-left">Swap</h2>
                <Card
                    className="!py-4"
                    type="tabs"
                    tabs={['ERC20', 'NFT']}
                    onTabChange={clearTrade}
                >
                    <div className="mb-3">
                        <SwitchToggle
                            labelOff="OTC"
                            labelOn="Public"
                            state={!isPublic}
                            setState={() => setIsPublic(!isPublic)}
                            customColors={[
                                'bg-gradient-to-tr to-indigo-700 from-sky-400',
                                'bg-gradient-to-tr to-green-700 from-emerald-400',
                            ]}
                        />
                    </div>
                    <Tab.Panel>
                        <SwapModule
                            trade={trade}
                            updateTrade={updateTrade}
                            disabled={isButtonDisabled()}
                            onClick={handleSwap}
                            loading={loading}
                            setTrade={setTrade}
                        />
                    </Tab.Panel>
                    <Tab.Panel>
                        <SwapModule
                            type="nft"
                            trade={trade}
                            updateTrade={updateTrade}
                            disabled={isButtonDisabled()}
                            onClick={handleSwap}
                            loading={loading}
                        />
                    </Tab.Panel>
                </Card>
            </div>

            <TransitionModal state={isModalOpen} setState={setIsModalOpen}>
                <Card className="border border-neutral-800 w-full">
                    <div className="flex flex-col gap-3 lg:gap-6">
                        <div className="flex items-center justify-between">
                            <span>Swap Initiated</span>
                            <button
                                className="p-1 relative -mt-0.5 -mr-2"
                                onClick={handleModalClose}
                            >
                                <MdClose
                                    size={24}
                                    className="hover:text-neutral-300 transition duration-100"
                                />
                            </button>
                        </div>
                        <div className="border border-neutral-600 bg-gradient-to-t from-blue-500 to-blue-600 px-2 py-1 rounded-lg">
                            <span>Please do not leave the app until the trade is complete</span>
                        </div>

                        <div>
                            <span className="text-xs">Share Link:</span>
                            <CopyClipboard value={createTradeLink()} icon>
                                <Input
                                    noSpace
                                    className="pointer-events-none"
                                    type="text"
                                    value={createTradeLink()}
                                />
                            </CopyClipboard>
                        </div>

                        <div className="flex justify-end gap-4 mt-3">
                            <Button
                                type="transparent"
                                onClick={() => navigate('/account', { state: { tab: 'Offers' } })}
                            >
                                My Offers
                            </Button>
                            <Button onClick={handleModalClose}>Close</Button>
                        </div>
                    </div>
                </Card>
            </TransitionModal>

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
