import { useState } from 'react';
import { useGlobalContext } from '../stores/global';
import { BASE_URL, EMPTY_TRADE, ITradeProps } from '../utils/common';
import { usePintswap } from './pintswap';
import { Pintswap } from 'pintswap-sdk';
import { useSigner } from 'wagmi';

export const useTrade = () => {
    const { addTrade } = useGlobalContext();
    const [loading, setLoading] = useState(false);
    const [generatedAddress, setGeneratedAddress] = useState(BASE_URL);
    const [trade, setTrade] = useState<ITradeProps>(EMPTY_TRADE);
    const { peer } = usePintswap()
    const { data: signer } = useSigner();

    const broadcastTrade = async () => {
        setLoading(true);
        // TODO: implement broadcast trade here and generate address
        if(peer && signer) {
            // Breaking 
            const pintswap = new Pintswap({ signer, peerId: peer });
            await pintswap.createTrade(peer, {
                givesToken: trade.tokenIn,
                getsToken: trade.tokenOut,
                givesAmount: trade.amountIn,
                getsAmount: trade.amountOut
            })
        }
        setGeneratedAddress(`${BASE_URL}${peer}/<order>`);
        setTrade(EMPTY_TRADE);
        setLoading(false);
        addTrade(trade);
    };

    const updateTrade = (key: 'tokenIn' | 'tokenOut' | 'amountIn' | 'amountOut', val: string) => {
        setTrade({
            ...trade,
            [key]: val,
        });
    };

    return {
        loading,
        broadcastTrade,
        generatedAddress,
        trade,
        updateTrade,
    };
};
