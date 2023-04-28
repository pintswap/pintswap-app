import { Tab, Transition } from '@headlessui/react';
import { useEffect, useState } from 'react';
import {
    Button,
    Card,
    CopyClipboard,
    Input,
    DropdownInput,
    PageStatus,
    DataTable,
    NFTDisplay,
} from '../components';
import { useTrade } from '../hooks/trade';
import { useOffersContext } from '../stores';
import { BASE_URL, convertAmount, INFTProps } from '../utils/common';
import { fetchNFT } from '../utils/fetch-nft';

const columns = [
    {
        name: 'hash',
        label: 'Hash',
    },
    {
        name: 'sending',
        label: 'Sending',
    },
    {
        name: 'receiving',
        label: 'Receiving',
    },
];

export const CreateView = () => {
    const { broadcastTrade, loading, trade, order, updateTrade, steps } = useTrade();
    const { openTrades } = useOffersContext();
    const [nft, setNFT] = useState<INFTProps | null>(null);

    const createTradeLink = () => {
        let finalUrl = `${BASE_URL}/#/fulfill/${order.multiAddr}`;
        if(trade.gives.tokenId) {
            finalUrl = `${finalUrl}/nft/${order.orderHash}`
        } else {
            finalUrl = `${finalUrl}/${order.orderHash}`
        }
        return finalUrl;
    }

    useEffect(() => {
        (async () => {
            const { gives } = trade;
            if (gives.tokenId && gives.token) {
                const n = await fetchNFT({ token: gives.token, tokenId: gives.tokenId });
                setNFT(n);
            }
        })().catch((err) => console.error(err));
    }, [trade.gives.tokenId, trade.gives.token]);

    const TABS = ['ERC20', 'NFT']
    return (
        <>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="view-header">Create Trade</h2>
                        <Transition
                            show={!!order.orderHash && !!order.multiAddr}
                            enter="transition-opacity duration-75"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="transition-opacity duration-150"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                            className="flex flex-col justify-center items-start text-center"
                        >
                            <p className="text-sm">Trade Link:</p>
                            <CopyClipboard
                                value={createTradeLink()}
                                icon
                                lg
                                truncate={5}
                            />
                        </Transition>
                    </div>
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
                            <NFTDisplay 
                                nft={nft}
                            />
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
                                        updateTrade('gives.tokenId', currentTarget.value)
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
                
                <Transition
                    show={openTrades.size !== 0}
                    enter="transition-opacity duration-75"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    className="flex flex-col"
                >     
                    <h2 className="view-header">Open Trades</h2>
                    <Card>
                        <DataTable 
                            title="Open Orders"
                            columns={columns}
                            data={Array.from(openTrades, (entry) => ({
                                hash: entry[0],
                                sending: convertAmount('readable', (entry[1].gives.amount || ''), entry[1].gives.token),
                                receiving: convertAmount('readable', (entry[1].gets.amount || ''), entry[1].gets.token),
                            }))}
                            type="manage"
                            toolbar={false}
                        />
                    </Card>               
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
