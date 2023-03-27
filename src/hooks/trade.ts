import { useState } from 'react';
import { useGlobalContext } from '../stores/global';
import { BASE_URL, EMPTY_TRADE, ITradeProps } from '../utils/common';
import { Pintswap } from 'pintswap-sdk';
import { usePintswap } from './pintswap';

export const useTrade = () => {
    const { addTrade } = useGlobalContext();
    const [loading, setLoading] = useState(false);
    const [generatedAddress, setGeneratedAddress] = useState(BASE_URL);
    const [trade, setTrade] = useState<ITradeProps>(EMPTY_TRADE);
    const { peer } = usePintswap()

    const broadcastTrade = async (signer: any, tradeProps: ITradeProps) => {
        setLoading(true);
        // TODO: implement broadcast trade here and generate address
        if(peer) {
            setTrade(tradeProps)
            const pintswap = new Pintswap({ signer, peerId: peer });
            // await pintswap.createTrade(peer, {
            //     givesToken: tradeProps.tokenIn,
            //     getsToken: tradeProps.tokenOut,
            //     givesAmount: tradeProps.amountIn,
            //     getsAmount: tradeProps.amountOut
            // })
        }
        setGeneratedAddress(`${BASE_URL}${peer}/<order>`);
        setTrade(EMPTY_TRADE);
        setLoading(false);
        addTrade(tradeProps);
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
