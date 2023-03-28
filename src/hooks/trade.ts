import { useEffect, useState } from 'react';
import { useGlobalContext } from '../stores/global';
import { EMPTY_TRADE, ITradeProps } from '../utils/common';
import { Pintswap } from 'pintswap-sdk';
import { useSigner } from 'wagmi';
import { useLocation } from 'react-router-dom';

type IOrderStateProps = {
    orderHash: string;
    multiAddr: string;
}

export const useTrade = () => {
    const { pathname } = useLocation();
    const { addTrade } = useGlobalContext();
    const [loading, setLoading] = useState(false);
    const [trade, setTrade] = useState<ITradeProps>(EMPTY_TRADE);
    const { data: signer } = useSigner();
    const [order, setOrder] = useState<IOrderStateProps>({ orderHash: '', multiAddr: '' });

    const broadcastTrade = async () => {
        setLoading(true);
        // TODO: implement broadcast trade here and generate address
        console.log("CREATE TRADE:", trade)
        if(signer) {
            // Breaking 
            const ps = await Pintswap.initialize({ signer });
            // await ps.startNode()
            // await ps.createTrade(ps.peerId, {
            //     givesToken: trade.tokenIn,
            //     getsToken: trade.tokenOut,
            //     givesAmount: trade.amountIn,
            //     getsAmount: trade.amountOut
            // })
            // setOrder({ multiAddr: ps.peerId, orderHash: '' })
        }
        addTrade(trade);
    };

    const fulfillTrade = async () => {
        setLoading(true);
        if(signer) {
            console.log("FULFILL TRADE:", trade);
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
    };
};
