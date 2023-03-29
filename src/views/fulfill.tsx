import { Transition } from "@headlessui/react";
import { Button, Card, CopyClipboard, Input } from "../components";
import { Dropdown } from "../components/dropdown";
import { useTrade } from "../hooks/trade";
import { BASE_URL } from "../utils/common";
import { TOKENS } from "../utils/token-list";

export const FulfillView = () => {
    const { fulfillTrade, loading, trade, order } = useTrade();
    return (
        <div className="flex flex-col gap-6">
            <Card className="self-center" header="Fulfill Trade">
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
                    <Dropdown 
                        title="In Details"
                        placeholder="Please select a token..."
                        state={TOKENS.find((el) => el.address === trade.tokenIn)?.symbol}
                        type="tokenIn"
                        disabled
                    />
                    <Input
                        placeholder="Amount to Trade"
                        value={trade.amountIn}
                        type="number"
                    />
                    <Dropdown 
                        title="Out Details"
                        placeholder="Please select a token..."
                        state={TOKENS.find((el) => el.address === trade.tokenOut)?.symbol}
                        type="tokenOut"
                        disabled

                    />
                    <Input
                        placeholder="Amount to Receive"
                        value={trade.amountOut}
                        type="number"
                    />
                </div>
                <Button
                    className="mt-6 w-full"
                    loadingText="Broadcasting"
                    loading={loading}
                    onClick={fulfillTrade}
                    disabled={
                        !trade.amountIn || !trade.amountOut || !trade.tokenIn || !trade.tokenOut
                    }
                >
                    Fulfill Trade
                </Button>
                
                {/* <div>
                    <p className="text-sm">Multi Address:</p>
                    <CopyClipboard value={order.multiAddr} icon lg />
                </div> */}
            </Card>
        </div>
    );
};
