import React, { useEffect, useState } from 'react';
import { usePintswapContext } from '../stores/pintswap';
import { useParams, useLocation } from 'react-router-dom';
import { DEFAULT_PROGRESS, IOrderProgressProps } from '../components/progress-indicator';
import { hashOffer, IOffer, ITransfer } from '@pintswap/sdk';
import PeerId from 'peer-id';
import { toast } from 'react-toastify';
import { useOffersContext, useUserContext } from '../stores';
import { toBeHex, isAddress } from 'ethers6';
import {
    savePintswap,
    updateToast,
    convertAmount,
    EMPTY_TRADE,
    getTokenAttributes,
    TESTING,
    ITokenProps,
    IOrderStateProps,
    IOrderbookProps,
    reverseSymbolCache,
    getSymbol,
    getTokenAddress,
} from '../utils';
import { ethers } from 'ethers';

export const resolveName = async (pintswap: any, name: any) => {
    while (true as any) {
        try {
            return await pintswap.resolveName(name);
        } catch (e) {
            if (!(e as any).message.match('no valid addresses')) throw e;
            await new Promise((resolve) => setTimeout(resolve, 1500));
        }
    }
};

export const useTrade = () => {
    const params = useParams();
    const { pathname } = useLocation();
    const {
        pintswap: { module },
    } = usePintswapContext();
    const { toggleActive, userData } = useUserContext();
    const { addTrade, userTrades, setPeerTrades, peerTrades, setUserTrades } = useOffersContext();

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
    const { multiaddr, hash } = useParams();
    const [fill, setFill] = useState<any>(null);

    const isMaker = pathname === '/create';
    const isOnActive = pathname === '/explore';

    const buildTradeObj = async ({ gets, gives }: IOffer): Promise<IOffer> => {
        if (!gets.token && !gives.token) return EMPTY_TRADE;
        const foundGivesToken = (await getTokenAttributes(gives.token, module?.signer)) as
            | ITokenProps
            | undefined;
        const foundGetsToken = (await getTokenAttributes(gets.token, module?.signer)) as
            | ITokenProps
            | undefined;

        // NFT
        if (gives?.tokenId) {
            const builtObj = {
                gives: {
                    ...gives,
                    tokenId: ethers.utils.hexlify(Number(gives.tokenId)),
                    amount: undefined,
                },
                gets: {
                    token: getTokenAddress(foundGetsToken, gets),
                    amount: await convertAmount(
                        'hex',
                        gets?.amount || '0',
                        gets.token,
                        module?.signer,
                    ),
                },
            };
            if (TESTING) console.log('#buildTradeObj:', builtObj);
            return builtObj;
        }
        console.log('hitting');
        // ERC20
        const builtObj = {
            gives: {
                token: getTokenAddress(foundGivesToken, gives),
                amount: await convertAmount(
                    'hex',
                    gives?.amount || '0',
                    gives.token,
                    module?.signer,
                ),
            },
            gets: {
                token: getTokenAddress(foundGetsToken, gets),
                amount: await convertAmount('hex', gets?.amount || '0', gets.token, module?.signer),
            },
        };
        if (TESTING) console.log('#buildTradeObj:', builtObj);
        return builtObj;
    };

    const displayTradeObj = async ({ gets, gives }: IOffer) => {
        try {
            return {
                gives: {
                    token:
                        ((await getTokenAttributes(
                            gives.token,
                            module?.signer,
                            'symbol',
                        )) as string) || gives.token,
                    amount: await convertAmount(
                        'number',
                        gives.amount || '',
                        gives.token,
                        module?.signer,
                    ),
                },
                gets: {
                    token:
                        ((await getTokenAttributes(
                            gets.token,
                            module?.signer,
                            'symbol',
                        )) as string) || gets.token,
                    amount: await convertAmount(
                        'number',
                        gets.amount || '',
                        gets.token,
                        module?.signer,
                    ),
                },
            };
        } catch (err) {
            console.error(err);
            return {
                gives: {
                    token: gives.token,
                    amount: gives.amount,
                },
                gets: {
                    token: gets.token,
                    amount: gets.amount,
                },
            };
        }
    };

    // Create trade
    const broadcastTrade = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (TESTING) console.log('#broadcastTrade: TradeObj', await buildTradeObj(trade));
        if (module) {
            try {
                module.broadcastOffer(await buildTradeObj(trade));
                savePintswap(module);
                if (!userData.active) toggleActive();
            } catch (err) {
                console.error(err);
            }
        }
        toast.loading('Connecting to peer...', { toastId: 'findPeer' });
    };

    // Fulfill trade
    const fulfillTrade = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setLoading({ ...loading, fulfill: true });
        if (module) {
            try {
                let multiAddr = order.multiAddr;
                if (multiAddr.match(/\.drip$/))
                    multiAddr = await resolveName(module, order.multiAddr);
                const peeredUp = PeerId.createFromB58String(multiAddr);
                // If NFT swap
                if (window.location.hash.match('nft') && hash) {
                    const nftTrade = userTrades.get(hash) || peerTrades.get(hash);
                    if (TESTING) console.log('#fulfillTrade - NFT Trade:', nftTrade);
                    module.createTrade(peeredUp, nftTrade);
                    // If peer orderbook swap
                } else if (params.base && params.trade) {
                    if (TESTING) console.log('#fulfillTrade - Fill:', fill);
                    module.createBatchTrade(
                        peeredUp,
                        fill.fill.map((v: any) => ({ offer: v.offer, amount: toBeHex(v.amount) })),
                    );
                    // If standard swap
                } else {
                    if (TESTING)
                        console.log('#fulfillTrade - Trade Obj:', await buildTradeObj(trade));
                    module.createTrade(peeredUp, await buildTradeObj(trade));
                }
                if (TESTING) console.log('Fulfilled trade!');
            } catch (err) {
                console.error(err);
                setError(true);
            }
        }
    };

    // Get single trade or all peer trades
    const getTrades = async (multiAddr: string, orderHash?: string) => {
        let resolved = multiAddr;
        if (multiAddr.match(/\.drip$/) && module) resolved = await resolveName(module, multiAddr);
        if (TESTING) console.log('#getTrades - Args:', { resolved, multiAddr, orderHash: hash });
        const trade = hash ? userTrades.get(hash) : undefined;
        // MAKER
        if (trade) setTrade(trade);
        // TAKER
        else {
            if (module) {
                try {
                    // TODO: optimize
                    if (orderHash && peerTrades.get(orderHash)) {
                        const { gives, gets } = peerTrades.get(orderHash) as any;
                        setTrade(await displayTradeObj({ gets, gives }));
                        return;
                    }

                    const { offers }: IOrderbookProps = await module.getUserDataByPeerId(resolved);
                    await Promise.all(
                        offers.map((offer) => {
                            const tokens = [offer.gets?.token, offer.gives?.token];
                            return Promise.all(
                                tokens.map(async (t) => {
                                    if (!Object.values(reverseSymbolCache).includes(t)) {
                                        const symbol = await getSymbol(t, module.signer);
                                        reverseSymbolCache[symbol] = t;
                                    }
                                }),
                            );
                        }),
                    );
                    if (TESTING) console.log('#getTrades - Offers:', offers);
                    if (offers?.length > 0) {
                        // If only multiAddr in URL
                        if (TESTING) console.log('#getTrades - Order Hash:', hash);
                        const map = new Map(offers.map((offer) => [hashOffer(offer), offer]));
                        if (TESTING) console.log('#getTrades - Map:', map);
                        setPeerTrades(map);
                        // Set first found trade as trade state
                        const { gives, gets } = offers[0];
                        setTrade(await displayTradeObj({ gets, gives }));
                    }
                } catch (err) {
                    console.error('Error in #getTrade:', err);
                    setError(true);
                    updateToast('findPeer', 'error', 'Error while finding peer');
                }
            }
        }
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

    // Clear Trade
    const clearTrade = () => setTrade(EMPTY_TRADE);

    // Update progress indicator
    const updateSteps = (nextStep: 'Create' | 'Fulfill' | 'Complete') => {
        const updated: IOrderProgressProps[] = steps.map((step, i) => {
            if (step.status === 'current') return { ...step, status: 'complete' };
            else if (step.name === nextStep) return { ...step, status: 'current' };
            else return step;
        });
        setSteps(updated);
    };

    // Get trade based on URL
    useEffect(() => {
        const getter = async () => {
            if (pathname.includes('/') && multiaddr) {
                const splitUrl = pathname.split('/');
                if (splitUrl[1] === 'fulfill' && hash) {
                    // If multiAddr and orderHash
                    setLoading({ ...loading, trade: true });
                    if (steps[1].status !== 'current') updateSteps('Fulfill');
                    setOrder({ multiAddr: multiaddr, orderHash: hash });
                    await getTrades(multiaddr, hash);
                    setLoading({ ...loading, trade: false });
                } else if (multiaddr) {
                    // Only multiAddr
                    setLoading({ ...loading, allTrades: true });
                    if (params.base && params.trade && steps[1].status !== 'current')
                        updateSteps('Fulfill');
                    setOrder({ multiAddr: multiaddr, orderHash: '' });
                    await getTrades(multiaddr);
                    setLoading({ ...loading, allTrades: false });
                }
            }
        };
        if (module) getter().catch((err) => console.error(err));
    }, [module, multiaddr, hash]);

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
                updateToast('findPeer', 'success', 'Connected to peer!');
                break;
            case 2:
                console.log('#peerListener: found peer offers');
                updateToast('findPeer', 'success', 'Connected to peer!');
                break;
            case 3:
                console.log('#peerListener: returning offers');
                break;
        }
    };

    const makerListener = (step: 0 | 1 | 2 | 3 | 4 | 5) => {
        let shallow = new Map(userTrades);
        switch (step) {
            case 0:
                if (module) savePintswap(module);
                console.log('#makerListener: taker approving trade');
                toast('Taker is approving transaction...');
                break;
            case 1:
                console.log('#makerListener: taker approved trade');
                toast('Taker approved transaction!');
                break;
            case 2:
                console.log('#makerListener: swap is complete');
                updateSteps('Complete'); // only for maker
                shallow.delete(order.orderHash);
                setUserTrades(shallow);
                shallow = userTrades;
                break;
        }
    };

    const takerListener = (step: 0 | 1 | 2 | 3 | 4 | 5) => {
        let shallow = new Map(userTrades);
        switch (step) {
            case 0:
                console.log('#takerListener: fulfilling trade');
                break;
            case 1:
                console.log('#takerListener: taker approving token swap');
                break;
            case 2:
                console.log('#takerListener: approved token swap');
                break;
            case 3:
                console.log('#takerListener: building transaction');
                break;
            case 4:
                console.log('#takerListener: transaction built');
                break;
            case 5:
                console.log('#takerLister: swap complete');
                updateSteps('Complete'); // only for taker
                setLoading({ ...loading, fulfill: false });
                shallow.delete(order.orderHash);
                setUserTrades(shallow);
                break;
        }
    };

    const makerTradeListener = (trade: any) => {
        trade.on('error', (e: any) => {
            if (module) {
                module.logger.error(e);
                savePintswap(module);
            }
        });
    };

    useEffect(() => {
        if (module) {
            if (!isMaker && !isOnActive)
                toast.loading('Connecting to peer...', { toastId: 'findPeer' });
            module.on('pintswap/trade/peer', peerListener);
            module.on('pintswap/trade/taker', takerListener);
            module.on('pintswap/trade/maker', makerListener);
            module.on('trade:maker', makerTradeListener);

            return () => {
                module.removeListener('trade:maker', makerTradeListener);
                module.removeListener('pintswap/trade/taker', takerListener);
                module.removeListener('pintswap/trade/peer', peerListener);
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
                    setOrder({ multiAddr: module?.peerId.toB58String(), orderHash: hash });
                    addTrade(hash, await buildTradeObj(trade));
                    updateSteps('Fulfill');
                };
                module.on('pintswap/trade/broadcast', broadcastListener);
                return () => {
                    module.removeListener('pintswap/trade/broadcast', broadcastListener);
                };
            }
            return () => {};
        })().catch((err) => console.error(err));
    }, [module, trade]);

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
    };
};
