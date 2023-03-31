import { Transition } from "@headlessui/react";
import { Button, Card, CopyClipboard, Input, ProgressIndicator } from "../components";
import { Dropdown } from "../components/dropdown";
import { useTrade } from "../hooks/trade";
import { BASE_URL } from "../utils/common";
import { TOKENS } from "../utils/token-list";

export const FulfillView = () => {
    const { fulfillTrade, loading, trade, loadingTrade, steps } = useTrade();
    return (
        <div className="flex flex-col gap-6">
            <Card className="self-center" header="Fulfill Trade">
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
                    <Dropdown 
                        title="In Details"
                        placeholder="Please select a token..."
                        state={trade.givesToken}
                        type="givesToken"
                        disabled
                        loading={loadingTrade}
                    />
                    <Input
                        placeholder="Amount to Trade"
                        value={trade.givesAmount}
                        type="number"
                        disabled
                        loading={loadingTrade}
                    />
                    <Dropdown 
                        title="Out Details"
                        placeholder="Please select a token..."
                        state={trade.getsToken}
                        type="getsToken"
                        disabled
                        loading={loadingTrade}
                    />
                    <Input
                        placeholder="Amount to Receive"
                        value={trade.getsAmount}
                        type="number"
                        disabled
                        loading={loadingTrade}
                    />
                </div>
                <Button
                    className="mt-6 w-full"
                    loadingText="Broadcasting"
                    loading={loading}
                    onClick={fulfillTrade}
                    disabled={
                        !trade.getsAmount || !trade.givesAmount || !trade.getsToken || !trade.givesToken || loadingTrade
                    }
                >
                    Fulfill Trade
                </Button>
                
                {/* <div>
                    <p className="text-sm">Multi Address:</p>
                    <CopyClipboard value={order.multiAddr} icon lg />
                </div> */}
            </Card>

            <div className="mx-auto">
                <ProgressIndicator steps={steps} />
            </div>
        </div>
    );
};
