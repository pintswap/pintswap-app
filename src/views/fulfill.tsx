import { Transition } from "@headlessui/react";
import { Button, Card, CopyClipboard, Input, ProgressIndicator } from "../components";
import { Dropdown } from "../components/dropdown";
import { useTrade } from "../hooks/trade";
import { BASE_URL, truncate } from "../utils/common";
import { TOKENS } from "../utils/token-list";

export const FulfillView = () => {
    const { fulfillTrade, loading, trade, loadingTrade, steps, order } = useTrade();
    return (
        <div className="flex flex-col gap-6">
            <Card className="self-center" header="Fulfill Trade">
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
                    <Dropdown 
                        title="In Details"
                        placeholder="Please select a token..."
                        state={trade.givesToken.startsWith('0x') ? truncate(trade.givesToken) : trade.givesToken}
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
                        state={trade.getsToken.startsWith('0x') ? truncate(trade.getsToken) : trade.getsToken}
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
                    loadingText="Fulfilling"
                    loading={loading}
                    onClick={fulfillTrade}
                    disabled={
                        !trade.getsAmount || !trade.givesAmount || !trade.getsToken || !trade.givesToken || loadingTrade || loading
                    }
                >
                    Fulfill Trade
                </Button>
            </Card>

            <div className="mx-auto">
                <ProgressIndicator steps={steps} />
            </div>

            <Transition
                    show={!!order.orderHash && !!order.multiAddr}
                    enter="transition-opacity duration-75"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    className="flex flex-col justify-center items-center text-center"
                >
                    <p className="text-sm">Trade Link:</p>
                    <CopyClipboard value={`${BASE_URL}/#/${order.multiAddr}/${order.orderHash}`} icon lg isTruncated />
                </Transition>
        </div>
    );
};
