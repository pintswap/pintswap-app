import { MdArrowDownward, MdSettings } from 'react-icons/md';
import {
    Button,
    Card,
    CoinInput,
    Statistic,
    SwapModule,
    TooltipWrapper,
    TxDetails,
} from '../components';
import { useSubgraph, useTrade } from '../hooks';
import { useEffect } from 'react';
import { percentChange, toAddress } from '../utils';
import { usePintswapContext, usePricesContext } from '../stores';

export const SwapView = () => {
    const {
        pintswap: { chainId },
    } = usePintswapContext();
    const { loading, trade, broadcastTrade, updateTrade, isButtonDisabled, clearTrade } =
        useTrade();
    const { formatToUsd } = usePricesContext();
    const { data } = useSubgraph({
        address: toAddress(trade.gets.token, chainId),
        history: 'day',
    });

    const calculateChanges = () => {
        if (data?.token && data?.tokenDayDatas?.length) {
            return {
                price: percentChange(
                    formatToUsd(data?.token?.derivedETH),
                    data?.tokenDayDatas[1]?.priceUSD,
                ),
                liq: '',
                vol: '',
            };
        }
        return {
            price: undefined,
            liq: undefined,
            vol: undefined,
        };
    };

    useEffect(() => {
        if (!trade.gives.token) updateTrade('gives.token', 'ETH');
    }, [trade]);

    return (
        <div className="flex flex-col max-w-xl mx-auto">
            <h2 className="view-header text-left">Swap</h2>
            <SwapModule
                header="Swap"
                trade={trade}
                updateTrade={updateTrade}
                disabled={isButtonDisabled()}
                onClick={broadcastTrade}
                loading={loading}
            />
        </div>
    );
};
