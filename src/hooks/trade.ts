import { useEffect, useState } from 'react';
import { useGlobalContext } from '../stores/global';
import { EMPTY_TRADE, ITradeProps } from '../utils/common';
import { Pintswap } from 'pintswap-sdk';
import { useSigner } from 'wagmi';
import { useLocation } from 'react-router-dom';
import { DEFAULT_PROGRESS, IProgressIndicatorProps } from '../components/progress-indicator';

type IOrderStateProps = {
    orderHash: string;
    multiAddr: string | any;
}

export const useTrade = () => {
    const { pathname } = useLocation();
    const { addTrade } = useGlobalContext();
    const [loading, setLoading] = useState(false);
    const [trade, setTrade] = useState<ITradeProps>(EMPTY_TRADE);
    const { data: signer } = useSigner();
    const [order, setOrder] = useState<IOrderStateProps>({ orderHash: '', multiAddr: '' });
    const [steps, setSteps] = useState(DEFAULT_PROGRESS);

    const broadcastTrade = async () => {
        setLoading(true);
        console.log("CREATE TRADE:", trade)
        if(signer) {
            // TODO: return orderHash from pintswapSdk#createTrade
            // TODO: confirm amounts being sent are in appropriate values with ethers
            const ps = await Pintswap.initialize({ signer });
            await ps.startNode()
            const res = await ps.createTrade(ps.peerId, {
                givesToken: trade.tokenIn,
                getsToken: trade.tokenOut,
                givesAmount: trade.amountIn,
                getsAmount: trade.amountOut
            })
            setOrder({ multiAddr: ps.peerId, orderHash: '' })
        }
        addTrade(trade);
        updateSteps('Create', 'complete');
        updateSteps('Fulfill', 'current');
    };

    const fulfillTrade = async () => {
        setLoading(true);
        if(signer) {
            console.log("FULFILL TRADE:", trade);
            updateSteps('Fulfill', 'complete');
            updateSteps('Complete', 'current');
        }
        setLoading(false);
    }

    const getTrade = async (multiAddr: string, orderHash: string) => {
        setLoading(true);
        console.log("multi address:", multiAddr)
        console.log("order hash:", orderHash)
        setLoading(false);
    }

    const updateTrade = (key: 'tokenIn' | 'tokenOut' | 'amountIn' | 'amountOut', val: string) => {
        setTrade({
            ...trade,
            [key]: val,
        });
    };

    const updateSteps = (name: 'Create' | 'Fulfill' | 'Complete', status: 'upcoming' | 'current' | 'complete') => {
        setSteps(steps.map(el => (el.name === name ? Object.assign({}, el, { status }) : el)));
    }

    useEffect(() => {
        if(pathname.includes('/')) {
            const splitUrl = pathname.split('/');
            if(splitUrl.length === 3) {
                setOrder({ orderHash: splitUrl[1], multiAddr: splitUrl[2] })
                getTrade(splitUrl[1], splitUrl[2])
            }
        }
    }, []);

    return {
        loading,
        broadcastTrade,
        trade,
        updateTrade,
        fulfillTrade,
        getTrade,
        order,
        steps,
        updateSteps
    };
};
