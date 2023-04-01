import { useEffect, useState } from 'react';
import { useGlobalContext } from '../stores/global';
import { EMPTY_TRADE, getDecimals, TESTING, WS_URL } from '../utils/common';
import { useLocation, useNavigate } from 'react-router-dom';
import { DEFAULT_PROGRESS, IOrderProgressProps } from '../components/progress-indicator';
import { ethers } from 'ethers';
import { IOffer, hashOffer } from 'pintswap-sdk';
import { TOKENS } from '../utils/token-list';
import { usePeerContext } from '../stores';
import PeerId from 'peer-id';

type IOrderStateProps = {
    orderHash: string;
    multiAddr: string | any;
}

type IOrderbookProps = {
    offers: IOffer[]
}

export const useTrade = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { addTrade, pintswap, openTrades } = useGlobalContext();
    const { peer } = usePeerContext();
    const [loading, setLoading] = useState(false);
    const [trade, setTrade] = useState<IOffer>(EMPTY_TRADE);
    const [order, setOrder] = useState<IOrderStateProps>({ orderHash: '', multiAddr: '' });
    const [steps, setSteps] = useState(DEFAULT_PROGRESS);
    const [loadingTrade, setLoadingTrade] = useState(false);

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
    const broadcastTrade = async () => {
        setLoading(true);
        console.log("CREATE TRADE:", buildTradeObj())

        if(pintswap && peer.id) {
            try {
                // TODO: if ETH, convert to WETH first
                pintswap.broadcastOffer(buildTradeObj());
                const orderHash = hashOffer(buildTradeObj());
                setOrder({ multiAddr: pintswap.peerId.toB58String(), orderHash });
                addTrade(orderHash, trade);
                updateSteps('Fulfill');
            } catch (err) {
                console.error(err);
            }
        }
        setLoading(false);
    };

    // Fulfill trade
    const fulfillTrade = async () => {
        setLoading(true);
        if(pintswap) {
            try {
                const peeredUp = PeerId.createFromB58String(order.multiAddr);
                const makerPeerId = await pintswap.peerRouting.findPeer(peeredUp);
                const res = await pintswap.createTrade(makerPeerId, buildTradeObj());
                console.log("FULFILL TRADE:", res);
                updateSteps('Complete');
            } catch (err) {
                console.error(err);
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
                if(pintswap) {
                    const peeredUp = PeerId.createFromB58String(multiAddr);
                    if(TESTING) console.log('discovery', await (window as any).discoveryDeferred.promise);
                    const makerPeerId = await pintswap.peerRouting.findPeer(peeredUp);
                    if(TESTING) console.log("makerPeerId", makerPeerId)
                    const { offers }: IOrderbookProps = await pintswap.getTradesByPeerId(`${makerPeerId.id.toB58String()}`);
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
                    await getTrade(splitUrl[1], splitUrl[2]);
                    updateSteps('Fulfill');
                }
            }
        }
        getTrades()
    }, [pintswap]);

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
        loadingTrade
    };
};
