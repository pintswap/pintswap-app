import React, { useEffect, useState } from 'react';
import { usePintswapContext } from '../stores/pintswap';
import { useParams, useLocation } from 'react-router-dom';
import { DEFAULT_PROGRESS, IOrderProgressProps } from '../ui/components/progress-indicator';
import { hashOffer, IOffer } from '@pintswap/sdk';
import { toast } from 'react-toastify';
import { useNetworkContext, useOffersContext, useUserContext } from '../stores';
import {
    savePintswap,
    renderToast,
    EMPTY_TRADE,
    TESTING,
    IOrderStateProps,
    IOrderbookProps,
    reverseSymbolCache,
    getSymbol,
    buildOffer,
    displayOffer,
    convertAmount,
} from '../utils';
import { useSigner, useSwitchNetwork } from 'wagmi';
import { toBeHex } from 'ethers6';
import { waitForTransaction } from '@wagmi/core';

function stringify(obj: any) {
    let cache: any = [];
    let str = JSON.stringify(obj, function (key, value) {
        if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1 || value === window) {
                // Circular reference found, discard key
                return;
            }
            // Store value in our collection
            cache.push(value);
        }
        return value;
    });
    cache = null; // reset the cache
    return str;
}

export const useTrade = (isOTC?: boolean) => {
    const params = useParams();
    const { switchNetwork } = useSwitchNetwork();
    const { data: signer } = useSigner();
    const { newNetwork } = useNetworkContext();
    const { pathname } = useLocation();
    const {
        pintswap: { module, chainId },
    } = usePintswapContext();
    const { toggleActive, userData } = useUserContext();
    const { addTrade, userTrades, allOffers } = useOffersContext();
    const { signIfNecessary } = usePintswapContext();

    const [peerTrades, setPeerTrades] = useState<Map<string, IOffer>>(new Map());
    const [trade, setTrade] = useState<IOffer>(EMPTY_TRADE);
    const [order, setOrder] = useState<IOrderStateProps>({ orderHash: '', multiAddr: '' });
    const [steps, setSteps] = useState(DEFAULT_PROGRESS);
    const [loading, setLoading] = useState({
        trade: false,
        allTrades: false,
        fulfill: false,
        broadcast: false,
    });
    const [error, setError] = useState(false);
    const [fill, setFill] = useState<any>(null);
    const [foundPeerOffers, setFoundPeerOffers] = useState(false);

    const isMaker = pathname === '/create';
    const isOnActive = pathname === '/explore' || pathname === '/create';

    // Create trade
    const broadcastTrade = async (e: React.SyntheticEvent, isPublic = true) => {
        e.preventDefault();
        if (module) {
            try {
                const offer = await buildOffer(trade);

                await signIfNecessary();
                module.signer = signer;

                module.broadcastOffer(offer);
                setOrder({ ...order, orderHash: hashOffer(offer) });
                await savePintswap(module);
                if (isPublic && !userData.active) toggleActive();
                await addTrade(hashOffer(offer), offer);
            } catch (err) {
                console.error(err);
            }
        }
    };

    // Fulfill trade
    const fulfillTrade = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setLoading({ ...loading, fulfill: true });

        // Set loading
        renderToast('swapping', 'pending', `Initiating trade. Please do not refresh the page.`);
        if (module) {
            // Determine correct offer
            let offer = trade;
            try {
                // Determine multiaddr
                let multiAddr = order.multiAddr;
                // if (multiAddr.match(/\.drip$/))
                //     multiAddr = await module.resolveName(order.multiAddr);

                let tradeForWorker;
                if (window.location.hash.match('nft') && params.hash) {
                    // NFT
                    const nftTrade = userTrades.get(params.hash) || peerTrades.get(params.hash);
                    if (TESTING) console.log('#fulfillTrade - NFT Trade:', nftTrade);
                    tradeForWorker = { type: 'nft', trade: nftTrade };
                } else if (params.base && params.trade) {
                    // Batch Trade
                    if (TESTING) console.log('#fulfillTrade - Fill:', fill);
                    tradeForWorker = {
                        type: 'batch',
                        trade: fill.fill.map((v: any) => ({
                            offer: v.offer,
                            amount: toBeHex(v.amount),
                        })),
                    };
                } else if (fill) {
                    // Partial fill
                    const builtTrade = await buildOffer(offer);
                    if (TESTING) console.log('#fulfillTrade - Trade Obj:', builtTrade);
                    tradeForWorker = {
                        type: 'batch',
                        trade: [
                            {
                                offer: builtTrade,
                                amount: toBeHex(
                                    await convertAmount(
                                        'hex',
                                        fill,
                                        builtTrade?.gets?.amount || '',
                                        chainId,
                                    ),
                                ),
                            },
                        ],
                    };
                } else {
                    // Standard
                    const builtTrade = await buildOffer(offer);
                    if (TESTING) console.log('#fulfillTrade - Trade Obj:', builtTrade);
                    tradeForWorker = { type: 'default', trade: builtTrade };
                }
                await signIfNecessary();
                module.signer = signer;

                // Pass off to web worker
                // const worker = new Worker(new URL('../workers/trade.worker.ts', import.meta.url));
                // tradeForWorker = { ...tradeForWorker, module, peer: multiAddr };
                // console.log('passing to web worker', stringify(tradeForWorker));
                // worker.postMessage(stringify(tradeForWorker)); // TODO
                // worker.onerror = (err) => {
                //     console.error('#fulfillTrade - Error:', err);
                //     if (String(err).toLowerCase().includes('user rejected')) {
                //         renderToast('swapping', 'error', 'User rejected signature');
                //     } else {
                //         renderToast('swapping', 'error', 'Error occured while swapping');
                //     }
                // };
                // worker.addEventListener('message', (event) => console.log(event.data));
                // TEMP
                switch (tradeForWorker.type) {
                    case 'batch':
                        module.createBatchTrade(multiAddr, tradeForWorker.trade);
                        break;
                    case 'nft':
                        module.createTrade(multiAddr, tradeForWorker.trade);
                        break;
                    default:
                        module.createTrade(multiAddr, tradeForWorker.trade);
                        break;
                }
            } catch (err) {
                console.error(err);
                setError(true);
                renderToast('swapping', 'error', 'Error occured while swapping');
            }
        }
    };

    // Get single trade or all peer trades
    const getTrades = async () => {
        let _offers: Map<string, IOffer> = new Map();

        // If chainId
        if (params.chainid && Number(params.chainid) !== chainId && switchNetwork) {
            switchNetwork(Number(params.chainid));
        }

        // If multiaddr
        if (params.multiaddr) {
            let resolved = params.multiaddr;
            // if (params.multiaddr.match(/\.drip$/) && module)
            //     resolved = await module.resolveName(params.multiaddr);
            if (TESTING)
                console.log('#getTrades - Args:', {
                    resolved,
                    multiaddr: params.multiaddr,
                    hash: params.hash,
                });
            const { offers }: IOrderbookProps = module
                ? await module.getUserData(resolved)
                : { offers: [] };
            if (offers?.length > 0 && !peerTrades?.size) {
                await Promise.all(
                    offers.map(async (offer) => {
                        const tokens = [offer.gets?.token, offer.gives?.token];
                        return await Promise.all(
                            tokens.map(async (t) => {
                                if (!Object.values(reverseSymbolCache[chainId]).includes(t)) {
                                    const symbol = await getSymbol(t, chainId);
                                    reverseSymbolCache[chainId][symbol] = t;
                                }
                            }),
                        );
                    }),
                );
                _offers = new Map(offers.map((offer) => [hashOffer(offer), offer]));
                if (TESTING) console.log('#getTrades - Map:', _offers);
                setPeerTrades(_offers);
                renderToast('findPeer', 'success', 'Connected to peer!');
            }
        }

        // If offer hash
        if (params.hash) {
            if (TESTING) console.log('#getTrades - Order Hash:', params.hash);
            if (_offers.get(params.hash)) {
                setTrade(await displayOffer(_offers.get(params.hash) as IOffer));
                return;
            }

            // Check public orderbook if there's an offer hash
            const found = [...allOffers.erc20, ...allOffers.nft].find(
                (el) => el.hash?.toLowerCase() === params.hash,
            );
            if (found) {
                setTrade(found.raw);
                return;
            }

            // Check user
            const trade = params.hash ? userTrades.get(params.hash) : undefined;
            if (trade) setTrade(trade);
        }
        return;
    };

    // Update order form
    const updateTrade = (
        key:
            | 'gives.token'
            | 'gets.token'
            | 'gives.amount'
            | 'gets.amount'
            | 'gives.tokenId'
            | 'gets.tokenId',
        val: string,
    ) => {
        const parts: any = key.split('.');
        const newTrade = { ...trade };
        parts.slice(0, -1).reduce((r: any, v: any) => r[v], newTrade)[parts[parts.length - 1]] =
            val;
        setTrade(newTrade);
    };

    const isButtonDisabled = () => {
        return (
            !trade.gives.token ||
            (!trade.gives.amount && !trade.gives.tokenId) ||
            !trade.gets.token ||
            !trade.gets.amount
        );
    };

    // Clear Trade
    const clearTrade = () =>
        setTrade({ gets: { token: '', amount: '' }, gives: { token: '', amount: '' } });

    // Update progress indicator
    const updateSteps = (nextStep: 'Create' | 'Fulfill' | 'Complete') => {
        const updated: IOrderProgressProps[] = steps.map((step, i) => {
            if (step.status === 'current') return { ...step, status: 'complete' };
            else if (step.name === nextStep) return { ...step, status: 'current' };
            else return step;
        });
        setSteps(updated);
    };

    useEffect(() => {
        if (newNetwork) clearTrade();
    }, [newNetwork]);

    // Get trade based on URL
    useEffect(() => {
        const getter = async () => {
            if (pathname.includes('/')) {
                const splitUrl = pathname.split('/');
                if (splitUrl[1] === 'fulfill' && params.hash && !order.orderHash) {
                    // If multiAddr and orderHash
                    setLoading({ ...loading, trade: true });
                    if (steps[1].status !== 'current') updateSteps('Fulfill');
                    setOrder({ multiAddr: params.multiaddr, orderHash: params.hash });
                    await getTrades();
                    setLoading({ ...loading, trade: false });
                } else if (params.multiaddr) {
                    // Only multiAddr
                    setLoading({ ...loading, allTrades: true });
                    if (params.base && params.trade && steps[1].status !== 'current')
                        updateSteps('Fulfill');
                    setOrder({ multiAddr: params.multiaddr, orderHash: '' });
                    await getTrades();
                    setLoading({ ...loading, allTrades: false });
                }
            }
        };
        if (module) getter().catch((err) => console.error(err));
    }, [module, pathname, chainId, foundPeerOffers]);

    /*
     * TRADE EVENT MANAGER - START
     */
    const peerListener = (step: 0 | 1 | 2 | 3) => {
        switch (step) {
            case 0:
                console.log('#peerListener: finding peer orders');
                break;
            case 1:
                console.log('#peerListener: peer found');
                break;
            case 2:
                console.log('#peerListener: found peer offers');
                // renderToast('findPeer', 'success', 'Connected to peer!');
                break;
            case 3:
                console.log('#peerListener: returning offers');
                setFoundPeerOffers(true);
                break;
        }
    };

    const makerListener = (step: 0 | 1 | 2 | string) => {
        try {
            // let shallow = new Map(userTrades);
            switch (step) {
                case 0:
                    // if (module) savePintswap(module);
                    console.log('#makerListener: taker approving trade');
                    toast('Taker is approving transaction');
                    renderToast('swapping', 'pending', 'Peer taking transaction');
                    break;
                case 1:
                    console.log('#makerListener: taker approved trade');
                    // toast('Taker approved transaction!');
                    break;
                case 2:
                    console.log('#makerListener: swap is complete');
                    updateSteps('Complete'); // only for maker
                    module?.offers.delete(order.orderHash);
                    // setUserTrades(shallow);
                    // shallow = userTrades;
                    clearTrade();
                    renderToast('swapping', 'success');
                    break;
                default:
                    console.log('#makerListener: swap is complete');
                    break;
            }
        } catch (err) {
            console.error('#makerListener:', err);
            renderToast('swapping', 'error', 'Error occured while swapping');
        }
    };

    const takerListener = async (step: 0 | 1 | 2 | 3 | 4 | string) => {
        try {
            const [quote, base] = params.pair ? params.pair.split('-') : ['', ''];
            // let shallow = new Map(userTrades);
            switch (step) {
                case 0:
                    console.log('#takerListener: fulfilling trade');
                    break;
                case 1:
                    console.log('#takerListener: taker approving token swap');
                    toast.update('swapping', {
                        render: `Waiting for approval`,
                        className: 'text-sm',
                    });
                    break;
                case 2:
                    console.log('#takerListener: approved token swap');
                    toast.update('swapping', {
                        render: `Building transaction`,
                        className: 'text-sm',
                    });
                    break;
                case 3: {
                    console.log('#takerListener: building transaction');
                    toast.update('swapping', {
                        render: `Building transaction`,
                        className: 'text-sm',
                    });
                    break;
                }
                case 4:
                    console.log('#takerListener: transaction built');
                    break;
                default:
                    if (step === 'user rejected signing') {
                        console.log('#takerListener: rejected transaction');
                        toast.dismiss();
                    } else if (step === 'maker not responsive') {
                        console.log('#takerListener: maker unresponsive');
                        renderToast('swapping', 'error', 'Peer took too long to approve');
                    } else if (step === 'timeout' || step === 'ERROR') {
                        console.log('#takerListener: timeout');
                        renderToast('swapping', 'error', 'Error occured while swapping');
                    } else if (step === 'insufficient funds') {
                        console.log('#takerListener:', 'Not enough funds for gas');
                        renderToast('swapping', 'error', 'Insufficient ETH for gas');
                    } else if (step === 'dial request has no valid addresses') {
                        console.log('#takerListener:', step);
                        renderToast('swapping', 'error', 'Trade is no longer available');
                    } else {
                        console.log('#takerListener: swap complete');
                        updateSteps('Complete'); // only for taker
                        renderToast('swapping', 'pending', undefined, step);
                        await waitForTransaction({
                            hash: step as any,
                        });
                        renderToast('swapping', 'success', 'Swap successful', step);
                        clearTrade();
                        // setUserTrades(shallow);
                        // shallow.delete(order.orderHash);
                    }
                    setLoading({ ...loading, fulfill: false, trade: false });
                    if (!isOTC) clearTrade();
                    break;
            }
        } catch (err) {
            console.error('#takerListener:', err);
            renderToast('swapping', 'error', 'Error occured while swapping');
        }
    };

    const makerTradeListener = (trade: any) => {
        trade.on('error', (e: any) => {
            if (module) {
                // toast.error('Error occured')
                module.logger.error(e);
                // savePintswap(module);
            }
        });
    };

    useEffect(() => {
        if (module) {
            if (!isMaker && !isOnActive)
                toast.update('findPeer', { render: 'Connecting to peer...' });
            // module.on('pintswap/trade/peer', peerListener);
            module.on('pintswap/trade/taker', takerListener);
            module.on('pintswap/trade/maker', makerListener);
            module.on('trade:maker', makerTradeListener);

            return () => {
                module.removeListener('trade:maker', makerTradeListener);
                module.removeListener('pintswap/trade/taker', takerListener);
                // module.removeListener('pintswap/trade/peer', peerListener);
                module.removeListener('pintswap/trade/maker', makerListener);
            };
        }
        return () => {};
    }, [module]);

    useEffect(() => {
        (async () => {
            if (module) {
                const broadcastListener = async (hash: string) => {
                    if (TESTING) console.log(`#broadcastListener: trade broadcasted (${hash})`);
                    setOrder({
                        multiAddr: module && module.peerId && module.address,
                        orderHash: hash,
                    });
                    updateSteps('Fulfill');
                };
                module.on('pintswap/trade/broadcast', broadcastListener);
                return () => {
                    module.removeListener('pintswap/trade/broadcast', broadcastListener);
                };
            }
            return () => {};
        })().catch((err) => console.error(err));
    }, [module]);

    return {
        loading,
        broadcastTrade,
        trade,
        updateTrade,
        fulfillTrade,
        getTrades,
        order,
        steps,
        updateSteps,
        error,
        fill,
        setFill,
        setTrade,
        clearTrade,
        isButtonDisabled,
        peerTrades,
        setOrder,
    };
};
