import React, { useEffect, useState } from 'react';
import { useGlobalContext } from '../stores/global';
import { EMPTY_TRADE, getDecimals, TESTING } from '../utils/common';
import { useLocation } from 'react-router-dom';
import { DEFAULT_PROGRESS, IOrderProgressProps } from '../components/progress-indicator';
import { ethers } from 'ethers';
import { IOffer, hashOffer } from 'pintswap-sdk';
import { TOKENS } from '../utils/token-list';
import PeerId from 'peer-id';

type IOrderStateProps = {
    orderHash: string;
    multiAddr: string | any;
}

type IOrderbookProps = {
    offers: IOffer[]
}

export const useTrade = () => {
    const { pathname } = useLocation();
    const { addTrade, pintswap, openTrades, peer } = useGlobalContext();
    const [loading, setLoading] = useState(false);
    const [trade, setTrade] = useState<IOffer>(EMPTY_TRADE);
    const [order, setOrder] = useState<IOrderStateProps>({ orderHash: '', multiAddr: '' });
    const [steps, setSteps] = useState(DEFAULT_PROGRESS);
    const [loadingTrade, setLoadingTrade] = useState(false);
    const [error, setError] = useState(false);

    const buildTradeObj = (): IOffer => {
        if(!trade.getsToken || !trade.getsAmount || !trade.givesAmount || !trade.givesToken) return EMPTY_TRADE;
        const foundGivesToken = TOKENS.find((el) => el.symbol === trade.givesToken);
        const foundGetsToken = TOKENS.find((el) => el.symbol === trade.getsToken);
        return {
            givesToken: foundGivesToken ? foundGivesToken.address : trade.givesToken,
            getsToken: foundGetsToken ? foundGetsToken.address : trade.getsToken,
            givesAmount: ethers.utils.parseUnits(trade.givesAmount, getDecimals(trade.givesToken)).toHexString(),
            getsAmount: ethers.utils.parseUnits(trade.getsAmount, getDecimals(trade.getsToken)).toHexString()
        }
    }
    
    // Create trade
    const broadcastTrade = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setLoading(true);
        if(TESTING) console.log("CREATE TRADE:", buildTradeObj())
        if(pintswap.module) {
            try {
                pintswap.module.broadcastOffer(buildTradeObj());
                const orderHash = hashOffer(buildTradeObj());
                setOrder({ multiAddr: pintswap.module.peerId.toB58String(), orderHash });
                addTrade(orderHash, trade);
                updateSteps('Fulfill');
            } catch (err) {
                console.error(err);
            }
        }
        setLoading(false);
    };

    // Fulfill trade
    const fulfillTrade = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setLoading(true);
        if(pintswap.module) {
            try {
                if(TESTING) console.log(await pintswap.module.signer.getChainId())
                const peeredUp = PeerId.createFromB58String(order.multiAddr);
                if(TESTING) console.log(buildTradeObj());
                const res = await pintswap.module.createTrade(peeredUp, buildTradeObj());
                if(TESTING) console.log("FULFILL TRADE:", res);
                if(res) updateSteps('Complete');
                else setError(true);
            } catch (err) {
                console.error(err);
                setLoading(false);
                setError(true)
            }
        }
        setLoading(false);
    }

    const getTrade = async (multiAddr: string, orderHash: string) => {
        setLoadingTrade(true);
        try {
            const trade = openTrades.get(orderHash);
            // MAKER
            if(trade) setTrade(trade);
            // TAKER
            else {
                if(pintswap.module) {
                    try {
                        const peeredUp = PeerId.createFromB58String(multiAddr);
                        if(TESTING) console.log('discovery', await (window as any).discoveryDeferred.promise);
                        const makerPeerId = await pintswap.module?.peerRouting.findPeer(peeredUp);
                        if(TESTING) console.log("makerPeerId", makerPeerId)
                        const { offers }: IOrderbookProps = await pintswap.module.getTradesByPeerId(`${makerPeerId.id.toB58String()}`);
                        if(TESTING) console.log("Offers:", offers)
                        if(offers?.length > 0) {
                            const foundGivesToken = TOKENS.find(el => el.address.toLowerCase() === offers[0].givesToken.toLowerCase());
                            const foundGetsToken = TOKENS.find(el => el.address.toLowerCase() === offers[0].getsToken.toLowerCase())
                            setTrade({
                                givesToken: foundGivesToken?.symbol || offers[0].givesToken,
                                givesAmount: ethers.utils.formatUnits(offers[0].givesAmount, foundGivesToken?.decimals || 18),
                                getsToken: foundGetsToken?.symbol || offers[0].getsToken,
                                getsAmount: ethers.utils.formatUnits(offers[0].getsAmount, foundGetsToken?.decimals || 18)
                            })
                        }
                    } catch (err) {
                        console.error("Error in trade.ts#getTrade:", err);
                        setError(true);
                    }
                }
            }
        } catch (err) {
            console.error(err);
        }
        setLoadingTrade(false);
    }

    // Update order form
    const updateTrade = (key: 'givesToken' | 'getsToken' | 'givesAmount' | 'getsAmount', val: string) => {
        setTrade({
            ...trade,
            [key]: val,
        });
    };

    // Update progress indicator
    const updateSteps = (nextStep: 'Create' | 'Fulfill' | 'Complete') => {
        const updated: IOrderProgressProps[] = steps.map((step, i) => {
            if(step.status === 'current') return { ...step, status: 'complete' }
            else if(step.name === nextStep) return { ...step, status: 'current' }
            else return step
        });
        setSteps(updated)
    }

    // Get trade based on URL
    useEffect(() => {
        const getTrades = async () => {
            if(pathname.includes('/')) {
                const splitUrl = pathname.split('/');
                if(splitUrl.length === 3) {
                    setOrder({ multiAddr: splitUrl[1], orderHash: splitUrl[2] });
                    if(steps[1].status !== 'current') updateSteps('Fulfill');
                    await getTrade(splitUrl[1], splitUrl[2]);
                }
            }
        }
        if(pintswap.module && (peer.module?.id || (peer.module as any)?._id)) getTrades();
    }, [pintswap.module, peer.module]);

    return {
        loading,
        broadcastTrade,
        trade,
        updateTrade,
        fulfillTrade,
        getTrade,
        order,
        steps,
        updateSteps,
        loadingTrade,
        error
    };
};
