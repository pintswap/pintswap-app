import { MdArrowDownward, MdExpandMore, MdSettings } from 'react-icons/md';
import { Asset, Button, Card, Statistic, TxDetails } from '../components';
import { useTrade } from '../hooks';

export const SwapView = () => {
    const { fulfillTrade, loading, trade, steps, order, error } = useTrade();
    return (
        <div className="flex flex-col">
            <h2 className="view-header text-left">Swap</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-3 lg:gap-4">
                <Card className="!py-4">
                    <div className="flex items-center justify-between mb-6 px-0.5">
                        <span>Swap</span>
                        <button>
                            <MdSettings size={20} />
                        </button>
                    </div>

                    <div className="flex flex-col justify-center items-center gap-2">
                        <div className="w-full bg-neutral-800 px-2 lg:px-3 pb-4 pt-1 rounded-lg">
                            <span className="text-xs text-gray-400">You pay</span>
                            <div className="flex justify-between items-center gap-0.5">
                                <input
                                    className="py-3 text-2xl outline-none ring-0 bg-neutral-800 remove-arrow min-w-0"
                                    placeholder="0"
                                    type="number"
                                />
                                <button className="flex items-center gap-1 flex-none rounded-full bg-neutral-600 p-1">
                                    <Asset symbol="ETH" />
                                    <MdExpandMore />
                                </button>
                            </div>
                        </div>

                        <button className="absolute p-1.5 bg-brand-dashboard rounded-lg">
                            <div className="bg-neutral-800 p-1 rounded-md">
                                <MdArrowDownward />
                            </div>
                        </button>

                        <div className="w-full bg-neutral-800 px-2 lg:px-3 pb-4 pt-1 rounded-lg">
                            <span className="text-xs text-gray-400">You get</span>
                            <div className="flex justify-between items-center gap-0.5">
                                <input
                                    className="py-3 text-2xl outline-none ring-0 bg-neutral-800 remove-arrow box-content min-w-0"
                                    placeholder="0"
                                    type="number"
                                />
                                <button className="flex items-center gap-1 flex-none rounded-full bg-neutral-600 p-1">
                                    <Asset symbol="USDC" />
                                    <MdExpandMore />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 mt-2">
                        <TxDetails trade={trade} loading={loading.trade} type="fulfill" />
                        <Button className="w-full rounded-lg !py-3">Swap</Button>
                    </div>
                </Card>
                <Card className="!py-4">
                    <div className="flex items-center justify-between mb-6 px-0.5">
                        <span>Statistics</span>
                        <button></button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Statistic
                            label="Price"
                            value={`$1545.75`}
                            size="lg"
                            className="w-full col-span-2"
                            change={-8.2}
                        />
                        <Statistic
                            label="Liquidity"
                            value={`$29.3M`}
                            className="w-full"
                            change={-1.1}
                        />
                        <Statistic label="Volume" value={`$8.5M`} className="w-full" change={2.9} />
                        <Statistic
                            label="Market Cap"
                            value={`$221.9B`}
                            className="w-full"
                            change={-6.4}
                        />
                        <Statistic label="Supply" value={`120.1M`} className="w-full" />
                    </div>
                </Card>
            </div>
        </div>
    );
};
