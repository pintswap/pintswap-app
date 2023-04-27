import { Tab, Transition } from '@headlessui/react';
import {
    Button,
    Card,
    CopyClipboard,
    Input,
    DropdownInput,
    ProgressIndicator,
    PageStatus,
} from '../components';
import { useTrade } from '../hooks/trade';
import { BASE_URL } from '../utils/common';

export const CreateView = () => {
    const { broadcastTrade, loading, trade, order, updateTrade, steps } = useTrade();

    const TABS = ['ERC20', 'NFT']
    return (
        <>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col">
                    <h2 className="view-header">Create Trade</h2>
                    <Card type="tabs" tabs={TABS}>
                        <Tab.Panel>
                        <div className="grid grid-cols-1 gap-6 lg:gap-y-2 items-start">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 items-start">
                                <DropdownInput
                                    title="Send Details"
                                    placeholder="Select a token"
                                    state={trade.gives.token}
                                    setState={updateTrade}
                                    type="gives.token"
                                    search
                                    disabled={!!order.orderHash}
                                    customInput
                                />
                                <Input
                                    placeholder="Amount to Send"
                                    value={trade.gives.amount || ''}
                                    onChange={({ currentTarget }) =>
                                        updateTrade('gives.amount', currentTarget.value)
                                    }
                                    type="number"
                                    token={trade.gives.token || true}
                                    maxClick={updateTrade}
                                    disabled={!!order.orderHash}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 items-start">
                                <DropdownInput
                                    title="Receive Details"
                                    placeholder="Select a token"
                                    state={trade.gets.token}
                                    setState={updateTrade}
                                    type="gets.token"
                                    search
                                    disabled={!!order.orderHash}
                                    customInput
                                />
                                <Input
                                    placeholder="Amount to Receive"
                                    value={(trade.gets.amount || '')}
                                    onChange={({ currentTarget }) =>
                                        updateTrade('gets.amount', currentTarget.value.toUpperCase())
                                    }
                                    type="number"
                                    token={trade.gets.token || true}
                                    maxClick={updateTrade}
                                    disabled={!!order.orderHash}
                                />
                            </div>
                        </div>
                        </Tab.Panel>
                        <Tab.Panel>
                        <div className="grid grid-cols-1 gap-6 items-start">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 items-start">
                                <Input
                                    title="Send Details"
                                    placeholder="NFT Address"
                                    value={trade.gives.token || ''}
                                    onChange={({ currentTarget }) =>
                                        updateTrade('gives.token', currentTarget.value)
                                    }
                                    type="text"
                                    token={trade.gives.token || true}
                                    disabled={!!order.orderHash}
                                />
                                <Input
                                    placeholder="NFT Token ID"
                                    value={trade.gives.tokenId || ''}
                                    onChange={({ currentTarget }) =>
                                        updateTrade('gives.amount', currentTarget.value)
                                    }
                                    type="number"
                                    token={trade.gives.tokenId || true}
                                    disabled={!!order.orderHash}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 items-start">
                                <DropdownInput
                                    title="Receive Details"
                                    placeholder="Select a token"
                                    state={trade.gets.token}
                                    setState={updateTrade}
                                    type="gets.token"
                                    search
                                    disabled={!!order.orderHash}
                                    customInput
                                />
                                <Input
                                    placeholder="Amount to Receive"
                                    value={(trade.gets.amount || '')}
                                    onChange={({ currentTarget }) =>
                                        updateTrade('gets.amount', currentTarget.value.toUpperCase())
                                    }
                                    type="number"
                                    token={trade.gets.token || true}
                                    maxClick={updateTrade}
                                    disabled={!!order.orderHash}
                                />
                            </div>
                        </div>
                        </Tab.Panel>
                        <Button
                            checkNetwork
                            className="mt-6 w-full"
                            loadingText="Broadcasting"
                            loading={loading.broadcast}
                            onClick={broadcastTrade}
                            disabled={
                                !trade.gives.token ||
                                !trade.gives.amount ||
                                !trade.gets.token ||
                                !trade.gets.amount ||
                                !!order.orderHash
                            }
                        >
                            Create Trade
                        </Button>
                    </Card>
                </div>

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
                    <CopyClipboard
                        value={`${BASE_URL}/#/${order.multiAddr}/${order.orderHash}`}
                        icon
                        lg
                        truncate={5}
                    />
                </Transition>
            </div>
            <Transition
                show={steps[2].status === 'current'}
                enter="transition-opacity duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-150"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                className="flex flex-col justify-center items-center text-center"
            >
                <PageStatus type="success" />
            </Transition>
        </>
    );
};
