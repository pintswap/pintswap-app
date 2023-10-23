/**
 * @deprecated Now using new Swap view and Swap Module component
 */
import { Tab, Transition } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { Button, Card, CopyClipboard, Input, PageStatus, TooltipWrapper } from '../components';
import { DropdownInput, NFTDisplay } from '../features';
import { DataTable } from '../tables';
import { useTrade } from '../../hooks';
import { usePintswapContext, useOffersContext, useUserContext } from '../../stores';
import { BASE_URL, convertAmount, INFTProps, fetchNFT } from '../../utils';

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
    {
        name: '',
        label: '',
    },
];

export const CreateView = () => {
    const {
        broadcastTrade,
        loading,
        trade,
        order,
        updateTrade,
        steps,
        clearTrade,
        isButtonDisabled,
    } = useTrade();
    const { pintswap } = usePintswapContext();
    const { userData, toggleActive } = useUserContext();
    const { userTrades } = useOffersContext();

    const [nft, setNFT] = useState<INFTProps | null>(null);
    const [resolvedName, setResolvedName] = useState<any>(order.multiAddr);
    const [tableData, setTableData] = useState<any[]>([]);

    const createTradeLink = () => {
        let finalUrl = `${BASE_URL}/#/fulfill/${resolvedName}`;
        if (trade.gives.tokenId) {
            finalUrl = `${finalUrl}/nft/${order.orderHash}`;
        } else {
            finalUrl = `${finalUrl}/${order.orderHash}`;
        }
        return finalUrl;
    };

    useEffect(() => {
        (async () => {
            setResolvedName(order.multiAddr);
            // if (pintswap.module) {
            //     try {
            //         setResolvedName(await pintswap.module.resolveName(order.multiAddr));
            //     } catch (e) {
            //         pintswap.module.logger.error(e);
            //     }
            // }
        })().catch(
            (err) => (pintswap.module && pintswap.module.logger.error(err)) || console.error(err),
        );
    }, [order]);

    useEffect(() => {
        (async () => {
            const { gives } = trade;
            if (gives.tokenId && gives.token) {
                const n = await fetchNFT({ token: gives.token, tokenId: gives.tokenId });
                setNFT(n);
            }
        })().catch((err) => console.error(err));
    }, [trade.gives.tokenId, trade.gives.token]);

    useEffect(() => {
        (async () => {
            const tableDataRes = await Promise.all(
                Array.from(userTrades, async (entry) => ({
                    hash: entry[0],
                    sending: await convertAmount(
                        'readable',
                        entry[1].gives.amount || '',
                        entry[1].gives.token,
                        pintswap.chainId,
                    ),
                    receiving: await convertAmount(
                        'readable',
                        entry[1].gets.amount || '',
                        entry[1].gets.token,
                        pintswap.chainId,
                    ),
                })),
            );
            setTableData(tableDataRes);
        })().catch((err) => console.error(err));
    }, [userTrades.size]);

    const TABS = ['ERC20', 'NFT'];
    return (
        <>
            {' '}
            <div className="flex flex-col gap-4 md:gap-6">
                <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                        <h2 className="view-header mb-0">Create Trade</h2>
                        <Transition
                            show={!!order.orderHash && !!order.multiAddr}
                            enter="transition-opacity duration-75"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="transition-opacity duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                            className="flex flex-col justify-center items-end text-center"
                        >
                            <CopyClipboard value={createTradeLink()} icon lg truncate={5}>
                                Share Trade
                            </CopyClipboard>
                        </Transition>
                    </div>
                    <Card type="tabs" tabs={TABS} onTabChange={clearTrade}>
                        <Tab.Panel>
                            <div className="grid grid-cols-1 gap-4 md:gap-6 lg:gap-y-2 items-start">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 md:gap-3 items-start">
                                    <DropdownInput
                                        title="Send Details"
                                        placeholder="Select a token"
                                        state={trade.gives.token}
                                        setState={updateTrade}
                                        type="gives.token"
                                        search
                                        disabled={!!order.orderHash}
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 md:gap-3 items-start">
                                    <DropdownInput
                                        title="Receive Details"
                                        placeholder="Select a token"
                                        state={trade.gets.token}
                                        setState={updateTrade}
                                        type="gets.token"
                                        search
                                        disabled={!!order.orderHash}
                                    />
                                    <Input
                                        placeholder="Amount to Receive"
                                        value={trade.gets.amount || ''}
                                        onChange={({ currentTarget }) =>
                                            updateTrade(
                                                'gets.amount',
                                                currentTarget.value.toUpperCase(),
                                            )
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
                                {nft && (
                                    <div className="max-h-[180px] max-w-[180px] mx-auto overflow-hidden flex justify-center items-center">
                                        <NFTDisplay nft={nft} show="img" />
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 md:gap-3 items-start">
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
                                    />
                                    <Input
                                        placeholder="Amount to Receive"
                                        value={trade.gets.amount || ''}
                                        onChange={({ currentTarget }) =>
                                            updateTrade(
                                                'gets.amount',
                                                currentTarget.value.toUpperCase(),
                                            )
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
                            className="mt-4 md:mt-6 w-full"
                            loadingText="Broadcasting"
                            loading={loading.broadcast}
                            onClick={broadcastTrade}
                            disabled={isButtonDisabled()}
                        >
                            Create Trade
                        </Button>
                    </Card>
                </div>

                <Transition
                    show={userTrades.size !== 0}
                    enter="transition-opacity duration-75"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    className="flex flex-col"
                >
                    <h2 className="view-header">Open Trades</h2>
                    <Card>
                        <DataTable
                            columns={columns}
                            data={tableData}
                            type="manage"
                            toolbar={false}
                        />
                    </Card>
                    <TooltipWrapper
                        text={
                            userData.active
                                ? 'Removes offers from public orderbook'
                                : 'Posts offers to public orderbook'
                        }
                        id="create-module-publish"
                    >
                        <Button
                            onClick={toggleActive}
                            className="sm:max-w-lg sm:self-center mt-4"
                            type="outline"
                        >
                            {userData.active ? 'Stop Publishing' : 'Publish Offers'}
                        </Button>
                    </TooltipWrapper>
                </Transition>
            </div>
            <Transition
                show={steps[2].status === 'current'}
                enter="transition-opacity duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                className="flex flex-col justify-center items-center text-center"
            >
                <PageStatus type="success" />
            </Transition>
        </>
    );
};
