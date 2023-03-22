import { Transition } from '@headlessui/react';
import { Button, Card, CopyClipboard, Input } from '../components';
import { useTrade } from '../hooks/trade';
import { BASE_URL } from '../utils/common';

export const CreateView = () => {
    const { broadcastTrade, loading, trade, generatedAddress, updateTrade } = useTrade();
    return (
        <div className="flex flex-col gap-6">
            <Card className="self-center" header="Create Trade">
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
                    <Input
                        title="In Details"
                        max={8}
                        placeholder="Token to Trade"
                        value={trade.tokenIn}
                        onChange={({ currentTarget }) =>
                            updateTrade('tokenIn', currentTarget.value.toUpperCase())
                        }
                    />
                    <Input
                        placeholder="Amount to Trade"
                        value={trade.amountIn}
                        onChange={({ currentTarget }) =>
                            updateTrade('amountIn', currentTarget.value)
                        }
                        type="number"
                    />
                    <Input
                        title="Out Details"
                        max={8}
                        placeholder="Token to Recieve"
                        value={trade.tokenOut}
                        onChange={({ currentTarget }) =>
                            updateTrade('tokenOut', currentTarget.value.toUpperCase())
                        }
                    />
                    <Input
                        placeholder="Amount to Receive"
                        value={trade.amountOut}
                        onChange={({ currentTarget }) =>
                            updateTrade('amountOut', currentTarget.value.toUpperCase())
                        }
                    />
                </div>
                <Button
                    className="mt-6 w-full"
                    loadingText="Broadcasting"
                    loading={loading}
                    onClick={() => broadcastTrade(trade)}
                    disabled={
                        !trade.amountIn || !trade.amountOut || !trade.tokenIn || !trade.tokenOut
                    }
                >
                    Broadcast Trade
                </Button>
            </Card>
            <Transition
                show={generatedAddress !== BASE_URL}
                enter="transition-opacity duration-75"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-150"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                className="flex flex-col justify-center items-center text-center"
            >
                <p className="text-sm">Trade Link:</p>
                <CopyClipboard value={generatedAddress} icon lg />
            </Transition>
        </div>
    );
};
