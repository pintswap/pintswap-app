import {
    Button,
    Card,
    CopyClipboard,
    Input,
    PageStatus,
    SwitchToggle,
    TransitionModal,
} from '../components';
import { SwapModule } from '../features';
import { useTrade } from '../../hooks';
import React, { useEffect, useState } from 'react';
import { BASE_URL, DEFAULT_TIMEOUT, getChainId, renderToast } from '../../utils';
import { usePintswapContext } from '../../stores';
import { MdClose } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { Tab, Transition } from '@headlessui/react';
import { hashOffer } from '@pintswap/sdk';

export const SwapView = () => {
    const navigate = useNavigate();
    const {
        pintswap: { module },
    } = usePintswapContext();
    const chainId = getChainId();
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
    const [resolvedName, setResolvedName] = useState(module?.address);

    const handleSwap = async (e: React.SyntheticEvent) => {
        await broadcastTrade(e, isPublic);
        setIsModalOpen(true);
    };

    const handleModalClose = (e: any) => {
        clearTrade();
        setIsModalOpen(false);
    };

    const createTradeLink = () => {
        let finalUrl = `${BASE_URL}/#/fulfill/${resolvedName || module?.address}`;
        if (order.orderHash) {
            if (trade.gives?.tokenId) {
                finalUrl = `${finalUrl}/nft/${order.orderHash}`;
            } else {
                finalUrl = `${finalUrl}/${order.orderHash}`;
            }
        } else {
            renderToast('create-offer-link', 'error', 'Error creating share link');
            return ``;
        }
        return `${finalUrl}/${chainId}`;
    };

    useEffect(() => {
        (async () => {
            setResolvedName(order.multiAddr);
            if (module) {
                try {
                    // const dripName = await module.resolveName(module.peerId.toB58String());
                    setResolvedName(module.address);
                } catch (e) {
                    module && module.logger.error(e);
                }
            }
        })().catch((err) => (module && module.logger.error(err)) || console.error(err));
    }, [order]);

    useEffect(() => {
        if (steps[2].status === 'current') {
            renderToast('swapping', 'success');
            const timeout = setTimeout(() => {
                setIsModalOpen(false);
                clearTrade();
            }, DEFAULT_TIMEOUT);
            return () => clearTimeout(timeout);
        }
    }, [steps[2].status]);

    const determineTabs = () => {
        // TODO: fix up to work on all chains
        if (chainId !== 1) return ['ERC20', 'NFT'];
        return ['MARKET', 'LIMIT', 'NFT'];
    };
    return (
        <>
            <div className="flex flex-col max-w-lg mx-auto">
                <h2 className="view-header text-left">Create Offer</h2>
                <Card type="tabs" tabs={determineTabs()} onTabChange={clearTrade}>
                    <div className="mb-3">
                        <SwitchToggle
                            labelOn="Public"
                            labelOnTooltip="Post your offer to public orderbook"
                            labelOff="OTC"
                            labelOffTooltip="Keep your offer private"
                            state={!isPublic}
                            setState={() => setIsPublic(!isPublic)}
                            customColors={[
                                'bg-gradient-to-tr to-accent-dark from-accent-light',
                                'bg-gradient-to-tr to-green-700 from-emerald-400',
                            ]}
                        />
                    </div>
                    {/* TODO: fix to work on all chains */}
                    {chainId === 1 && (
                        <Tab.Panel>
                            <SwapModule
                                trade={trade}
                                updateTrade={updateTrade}
                                disabled={isButtonDisabled()}
                                onClick={handleSwap}
                                loading={loading}
                                setTrade={setTrade}
                                isPublic={isPublic}
                            />
                        </Tab.Panel>
                    )}
                    <Tab.Panel>
                        <SwapModule
                            trade={trade}
                            updateTrade={updateTrade}
                            disabled={isButtonDisabled()}
                            onClick={handleSwap}
                            loading={loading}
                            setTrade={setTrade}
                            isPublic={isPublic}
                            autoQuote={false}
                            percentDiff
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
                            isPublic={isPublic}
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
                                    disabled
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
