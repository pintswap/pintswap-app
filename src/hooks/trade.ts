import { useState } from 'react';
import { useGlobalContext } from '../stores/global';
import { BASE_URL, EMPTY_TRADE, ITradeProps } from '../utils/common';

export const useTrade = () => {
    const { addTrade } = useGlobalContext();
    const [loading, setLoading] = useState(false);
    const [generatedAddress, setGeneratedAddress] = useState(BASE_URL);
    const [trade, setTrade] = useState<ITradeProps>(EMPTY_TRADE);

    const broadcastTrade = async (tradeProps: ITradeProps) => {
        setLoading(true);
        // TODO: implement broadcast trade here and generate address
        await new Promise(function (resolve, reject) {
            setTimeout(resolve, 1000);
        });
        setGeneratedAddress(`${BASE_URL}<multiaddr>/<order>`);
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
