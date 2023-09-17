import { Button, Card, CopyClipboard, Input, SwapModule, TransitionModal } from '../components';
import { useTrade } from '../hooks';
import React, { useEffect, useState } from 'react';
import { BASE_URL } from '../utils';
import { usePintswapContext } from '../stores';
import { MdClose } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

export const SwapView = () => {
    const navigate = useNavigate();
    const {
        pintswap: { module, chainId },
    } = usePintswapContext();
    const { loading, trade, broadcastTrade, updateTrade, isButtonDisabled, clearTrade, order } =
        useTrade();
    const [isPublic, setIsPublic] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [resolvedName, setResolvedName] = useState(order.multiAddr);

    const handleSwap = async (e: React.SyntheticEvent) => {
        await broadcastTrade(e, isPublic);
        setIsModalOpen(true);
        clearTrade();
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
        if (!trade.gives.token) updateTrade('gives.token', 'ETH');
    }, [trade]);

    useEffect(() => {
        (async () => {
            setResolvedName(order.multiAddr);
            if (module) {
                try {
                    setResolvedName(await module.resolveName(order.multiAddr));
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
                <SwapModule
                    trade={trade}
                    updateTrade={updateTrade}
                    disabled={isButtonDisabled()}
                    onClick={handleSwap}
                    loading={loading}
                    otc={!isPublic}
                    toggleOtc={() => setIsPublic(!isPublic)}
                />
            </div>

            <TransitionModal state={isModalOpen} setState={setIsModalOpen}>
                <Card className="border border-neutral-800 w-full">
                    <div className="flex flex-col gap-3 lg:gap-6">
                        <div className="flex items-center justify-between">
                            <span>Swap Initiated</span>
                            <button
                                className="p-1 relative -mt-0.5 -mr-2"
                                onClick={() => setIsModalOpen(false)}
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
                            <Button onClick={() => setIsModalOpen(false)}>Close</Button>
                        </div>
                    </div>
                </Card>
            </TransitionModal>
        </>
    );
};
