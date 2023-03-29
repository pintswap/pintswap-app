import { useEffect, useState } from 'react';
import { useGlobalContext } from '../stores/global';
import { EMPTY_TRADE, ITradeProps } from '../utils/common';
import { Pintswap } from 'pintswap-sdk';
import { useSigner } from 'wagmi';
import { useLocation } from 'react-router-dom';
import { DEFAULT_PROGRESS } from '../components/progress-indicator';

type IOrderStateProps = {
    orderHash: string;
    multiAddr: string | any;
}

export const useTrade = () => {
    const { pathname } = useLocation();
    const { addTrade } = useGlobalContext();
    const [pintswap, setPintswap] = useState<any>();
    const [loading, setLoading] = useState(false);
    const [trade, setTrade] = useState<ITradeProps>(EMPTY_TRADE);
    const { data: signer } = useSigner();
    const [order, setOrder] = useState<IOrderStateProps>({ orderHash: '', multiAddr: '' });
    const [steps, setSteps] = useState(DEFAULT_PROGRESS);
    
    // Create trade
    const broadcastTrade = async () => {
        setLoading(true);
        console.log("CREATE TRADE:", trade)
        if(signer && pintswap) {
            try {
                // TODO: return orderHash from pintswapSdk#createTrade
                // TODO: confirm amounts being sent are in appropriate values with ethers
                const res = await pintswap.createTrade(pintswap.peerId, {
                    givesToken: trade.tokenIn,
                    getsToken: trade.tokenOut,
                    givesAmount: trade.amountIn,
                    getsAmount: trade.amountOut
                })
                setOrder({ multiAddr: pintswap.peerId, orderHash: res.orderHash });
                addTrade(trade);
                updateSteps('Create', 'complete');
                updateSteps('Fulfill', 'current');
            } catch (err) {
                console.error(err);
            }
        }
    };

    // Fulfill trade
    const fulfillTrade = async () => {
        setLoading(true);
        if(signer) {
            try {
                console.log("FULFILL TRADE:", trade);
                updateSteps('Fulfill', 'complete');
                updateSteps('Complete', 'current');
            } catch (err) {
                console.error(err);
            }
        }
        setLoading(false);
    }

    // TODO: connect to sdk
    const getTrade = async (multiAddr: string, orderHash: string) => {
        setLoading(true);
        try {
            console.log("multi address:", multiAddr)
            console.log("order hash:", orderHash)
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }

    // Update order form
    const updateTrade = (key: 'tokenIn' | 'tokenOut' | 'amountIn' | 'amountOut', val: string) => {
        setTrade({
            ...trade,
            [key]: val,
        });
    };

    // Update progress indicator
    const updateSteps = (name: 'Create' | 'Fulfill' | 'Complete', status: 'upcoming' | 'current' | 'complete') => {
        setSteps(steps.map(el => (el.name === name ? Object.assign({}, el, { status }) : el)));
    }

    // Get trade based on URL
    useEffect(() => {
        if(pathname.includes('/')) {
            const splitUrl = pathname.split('/');
            if(splitUrl.length === 3) {
                setOrder({ orderHash: splitUrl[1], multiAddr: splitUrl[2] })
                getTrade(splitUrl[1], splitUrl[2])
            }
        }
    }, []);

    // Initialize Pintswap
    useEffect(() => {
        const initialize = async () => {
            setLoading(true);
            try {
                console.log("signer:", signer) 
                const ps = await Pintswap.initialize({ signer });
                await ps.startNode();
                setPintswap(ps);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false)
            }
        }
        // if(!pintswap && signer) initialize(); // TODO: signer is not there on component mount
    }, [])

    console.log("Pintswap", pintswap)

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
        pintswap
    };
};
