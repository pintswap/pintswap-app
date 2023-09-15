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
        <div className="flex flex-col">
            <h2 className="view-header text-left">Swap</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-3 lg:gap-4">
                <SwapModule
                    trade={trade}
                    updateTrade={updateTrade}
                    disabled={isButtonDisabled()}
                    onClick={broadcastTrade}
                    loading={loading}
                />
                <Card className="!py-4 h-fit">
                    <div className="flex items-center justify-between mb-2 md:mb-3 lg:mb-4 px-0.5">
                        <span>Uniswap Stats</span>
                        {/* <span className="text-sm">24 hr</span> */}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Statistic
                            label="Price"
                            value={data?.token ? formatToUsd(data?.token?.derivedETH) : '-'}
                            size="lg"
                            className="w-full sm:col-span-2"
                            // change={}
                            type="usd"
                        />
                        <Statistic
                            label="Liquidity"
                            value={
                                data?.token
                                    ? (
                                          Number(data?.token?.totalLiquidity) *
                                          Number(formatToUsd(data?.token?.derivedETH))
                                      ).toString()
                                    : '-'
                            }
                            className="w-full"
                            // change={-1.1}
                            type="usd"
                        />
                        <Statistic
                            label="Daily Volume"
                            value={
                                data?.tokenDayDatas?.length
                                    ? data?.tokenDayDatas[0]?.dailyVolumeUSD
                                    : `-`
                            }
                            className="w-full"
                            // change={2.9}
                            type="usd"
                        />
                        <Statistic
                            label="Total Volume"
                            value={data?.token ? data?.token?.tradeVolumeUSD : `-`}
                            className="w-full"
                            type="usd"
                        />
                        <Statistic
                            label="TX Count"
                            value={data?.token ? data?.token?.txCount : `-`}
                            className="w-full"
                        />
                    </div>
                </Card>
            </div>
        </div>
    );
};
