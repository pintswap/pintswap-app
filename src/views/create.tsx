import { Transition } from '@headlessui/react';
import { useAccount } from 'wagmi';
import { Button, Card, CopyClipboard, Input } from '../components';
import { Dropdown } from '../components/dropdown';
import { useTrade } from '../hooks/trade';
import { BASE_URL } from '../utils/common';
import { TOKENS } from '../utils/token-list';

export const CreateView = () => {
    const { broadcastTrade, loading, trade, generatedAddress, updateTrade } = useTrade();
    const { address } = useAccount();
    return (
        <div className="flex flex-col gap-6">
            <Card className="self-center" header="Create Trade">
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
                    <Dropdown 
                        title="In Details"
                        placeholder="Please select a token..."
                        state={TOKENS.find((el) => el.address === trade.tokenIn)?.symbol}
                        setState={updateTrade}
                        type="tokenIn"
                        search
                    />
                    <Input
                        placeholder="Amount to Trade"
                        value={trade.amountIn}
                        onChange={({ currentTarget }) =>
                            updateTrade('amountIn', currentTarget.value)
                        }
                        type="number"
                    />
                    <Dropdown 
                        title="Out Details"
                        placeholder="Please select a token..."
                        state={TOKENS.find((el) => el.address === trade.tokenOut)?.symbol}
                        setState={updateTrade}
                        type="tokenOut"
                        search
                    />
                    <Input
                        placeholder="Amount to Receive"
                        value={trade.amountOut}
                        onChange={({ currentTarget }) =>
                            updateTrade('amountOut', currentTarget.value.toUpperCase())
                        }
                        type="number"
                    />
                </div>
                <Button
                    className="mt-6 w-full"
                    loadingText="Broadcasting"
                    loading={loading}
                    onClick={broadcastTrade}
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
