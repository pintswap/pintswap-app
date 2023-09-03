import { MdArrowDownward, MdSettings } from 'react-icons/md';
import { Button, Card, CoinInput, Statistic, TooltipWrapper, TxDetails } from '../components';
import { useSubgraph, useTrade } from '../hooks';
import { useEffect } from 'react';
import { TOKENS_BY_SYMBOL } from '../utils';
import { usePricesContext } from '../stores';

export const SwapView = () => {
    const { loading, trade, broadcastTrade, updateTrade, isButtonDisabled, clearTrade } =
        useTrade();
    const { formatToUsd } = usePricesContext();
    const { data } = useSubgraph({
        address: TOKENS_BY_SYMBOL[trade.gets.token]
            ? TOKENS_BY_SYMBOL[trade.gets.token]?.address
            : trade.gets.token,
    });

    useEffect(() => {
        if (!trade.gives.token) updateTrade('gives.token', 'ETH');
    }, [trade]);

    return (
        <div className="flex flex-col">
            <h2 className="view-header text-left">Swap</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-3 lg:gap-4">
                <Card className="!py-4">
                    <div className="flex items-center justify-between mb-2 md:mb-3 lg:mb-4 px-0.5">
                        <span></span>
                        <TooltipWrapper text="Working on it" id="working-on-it-swap-settings">
                            <button className="pl-2 py-0.5 hover:text-neutral-300 transition duration-100">
                                <MdSettings size={20} />
                            </button>
                        </TooltipWrapper>
                    </div>

                    <div className="flex flex-col justify-center items-center gap-1.5">
                        <CoinInput
                            label="You give"
                            value={trade.gives.amount}
                            onAssetClick={(e: any) =>
                                updateTrade('gives.token', e.target.innerText)
                            }
                            onAmountChange={({ currentTarget }) =>
                                updateTrade('gives.amount', currentTarget.value)
                            }
                            asset={trade.gives.token}
                        />

                        <button className="absolute p-1.5 bg-brand-dashboard rounded-lg">
                            <div className="bg-neutral-800 p-1 rounded-md">
                                <MdArrowDownward />
                            </div>
                        </button>
                        <CoinInput
                            label="You get"
                            value={trade.gets.amount || ''}
                            onAssetClick={(e: any) => updateTrade('gets.token', e.target.innerText)}
                            onAmountChange={({ currentTarget }) =>
                                updateTrade('gets.amount', currentTarget.value)
                            }
                            asset={trade.gets.token}
                        />
                    </div>

                    <div className="flex flex-col gap-2 mt-2">
                        <TxDetails trade={trade} loading={loading.trade} type="fulfill" />
                        <Button
                            className="w-full rounded-lg !py-3"
                            disabled={isButtonDisabled()}
                            loadingText="Broadcasting"
                            loading={loading.broadcast}
                            onClick={broadcastTrade}
                            checkNetwork
                        >
                            Swap
                        </Button>
                    </div>
                </Card>
                <Card className="!py-4 h-fit">
                    <div className="flex items-center justify-between mb-2 md:mb-3 lg:mb-4 px-0.5">
                        <span>Statistics</span>
                        <span className="text-sm">24 hr</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Statistic
                            label="Price"
                            value={data?.token ? formatToUsd(data?.token?.derivedETH) : '-'}
                            size="lg"
                            className="w-full sm:col-span-2"
                            // change={-8.2}
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
                            label="Total Volume"
                            value={data?.token ? data?.token?.tradeVolumeUSD : `-`}
                            className="w-full"
                            // change={2.9}
                            type="usd"
                        />
                        <Statistic
                            label="Market Cap"
                            value={`-`}
                            className="w-full"
                            // change={-6.4}
                            type="usd"
                        />
                        <Statistic
                            label="Supply"
                            value={data?.token ? data?.token?.totalSupply : `-`}
                            className="w-full"
                        />
                    </div>
                </Card>
            </div>
        </div>
    );
};
