import { MdArrowDownward, MdSettings } from 'react-icons/md';
import { Card } from './card';
import { TooltipWrapper } from './tooltip';
import { CoinInput } from './coin-input';
import { IOffer } from '@pintswap/sdk';
import { TxDetails } from './tx-details';
import { Button } from './button';
import React, { MouseEventHandler, useEffect, useState } from 'react';
import { StatusIndicator } from './status-indicator';
import { INFTProps, fetchNFT } from '../utils';
import { NFTDisplay } from './nft-display';
import { Input } from './input';
import { NFTInput } from './nft-input';

type ISwapModule = {
    trade: IOffer;
    loading?: {
        trade?: boolean;
        broadcast?: boolean;
        fulfill?: boolean;
    };
    onClick?: MouseEventHandler<HTMLButtonElement>;
    updateTrade?: (key: string | any, val: string) => void;
    disabled?: boolean;
    type?: 'swap' | 'fulfill' | 'nft';
    setTrade?: React.Dispatch<React.SetStateAction<IOffer>>;
};

export const SwapModule = ({
    trade,
    loading,
    updateTrade,
    onClick,
    disabled,
    type = 'swap',
    setTrade,
}: ISwapModule) => {
    const [nft, setNFT] = useState<INFTProps | null>(null);

    const determineLoadingText = () => {
        if (loading?.broadcast || loading?.fulfill) return 'Swapping';
        if (loading?.trade) return 'Loading Offer';
        return 'Loading';
    };
    const determineButtonText = () => {
        if (type === 'fulfill') return 'Fulfill';
        return 'Swap';
    };

    if (type === 'nft') {
        useEffect(() => {
            (async () => {
                const { gives } = trade;
                if (gives.tokenId && gives.token) {
                    const n = await fetchNFT({ token: gives.token, tokenId: gives.tokenId });
                    setNFT(n);
                }
            })().catch((err) => console.error(err));
        }, [trade.gives.tokenId, trade.gives.token]);
        console.log('trade', trade);
        return (
            <div className="flex flex-col justify-center items-center gap-1.5">
                {nft && (
                    <div className="max-h-[180px] max-w-[180px] mx-auto overflow-hidden flex justify-center items-center">
                        <NFTDisplay nft={nft} show="img" />
                    </div>
                )}
                {/* <div className="grid grid-cols-1 gap-1.5 items-start">
                    <Input
                        title="You give"
                        placeholder="NFT Contract Address"
                        value={trade.gives.token || ''}
                        onChange={({ currentTarget }: any) =>
                            updateTrade ? updateTrade('gives.token', currentTarget.value) : {}
                        }
                        type="text"
                        token={trade.gives.token || true}
                    />
                    <Input
                        placeholder="NFT Token ID"
                        value={trade.gives.tokenId || ''}
                        onChange={({ currentTarget }: any) =>
                            updateTrade ? updateTrade('gives.tokenId', currentTarget.value) : {}
                        }
                        type="number"
                        token={trade.gives.tokenId || true}
                        noSpace
                    />
                </div> */}
                <NFTInput
                    label="You give"
                    onAddressChange={({ currentTarget }: any) =>
                        updateTrade ? updateTrade('gives.token', currentTarget.value) : {}
                    }
                    onNftIdChange={({ currentTarget }: any) =>
                        updateTrade ? updateTrade('gives.tokenId', currentTarget.value) : {}
                    }
                    value={trade.gives?.token}
                    nftId={trade.gives?.tokenId}
                />
                <button className="absolute mb-16 p-1.5 bg-brand-dashboard rounded-lg">
                    <div className="bg-neutral-800 p-1 rounded-md">
                        <MdArrowDownward />
                    </div>
                </button>
                <CoinInput
                    label="You get"
                    value={trade.gets?.amount}
                    onAssetClick={(e: any) =>
                        updateTrade ? updateTrade('gets.token', e.target.innerText) : {}
                    }
                    onAmountChange={({ currentTarget }) =>
                        updateTrade ? updateTrade('gets.amount', currentTarget.value) : {}
                    }
                    asset={trade.gets?.token}
                    type={'swap'}
                    id="swap-module-get"
                />
                <Button
                    className="w-full rounded-lg !py-3"
                    disabled={disabled}
                    loadingText={determineLoadingText()}
                    loading={loading?.broadcast || loading?.fulfill || loading?.trade}
                    onClick={onClick}
                    checkNetwork
                    form="submit"
                >
                    {determineButtonText()}
                </Button>
            </div>
        );
    } else {
        const reverse = () => {
            setTrade &&
                trade.gives.token &&
                trade.gets.token &&
                setTrade({
                    gets: trade.gives,
                    gives: trade.gets,
                });
        };
        useEffect(() => {
            if (!trade.gives.token && updateTrade) updateTrade('gives.token', 'ETH');
        }, [trade]);

        return (
            <>
                <div className="flex flex-col justify-center items-center gap-1.5">
                    <CoinInput
                        label="You give"
                        value={trade.gives?.amount}
                        onAssetClick={(e: any) =>
                            updateTrade ? updateTrade('gives.token', e.target.innerText) : {}
                        }
                        onAmountChange={({ currentTarget }) =>
                            updateTrade ? updateTrade('gives.amount', currentTarget.value) : {}
                        }
                        asset={trade.gives?.token}
                        max={type === 'swap'}
                        disabled={type === 'fulfill'}
                        type={type}
                        id="swap-module-give"
                    />

                    <button
                        className="absolute p-1.5 bg-brand-dashboard hover:bg-black transition duration-150 rounded-lg"
                        onClick={reverse}
                    >
                        <div className="bg-neutral-800 p-1 rounded-md">
                            <MdArrowDownward />
                        </div>
                    </button>
                    <CoinInput
                        label="You get"
                        value={trade.gets?.amount}
                        onAssetClick={(e: any) =>
                            updateTrade ? updateTrade('gets.token', e.target.innerText) : {}
                        }
                        onAmountChange={({ currentTarget }) =>
                            updateTrade ? updateTrade('gets.amount', currentTarget.value) : {}
                        }
                        asset={trade.gets?.token}
                        disabled={type === 'fulfill'}
                        type={type}
                        id="swap-module-get"
                    />
                </div>

                <div className="flex flex-col gap-2 mt-2">
                    <TxDetails
                        trade={trade}
                        loading={typeof loading === 'boolean' ? loading : loading?.trade}
                        type="fulfill"
                    />
                    <Button
                        className="w-full rounded-lg !py-3"
                        disabled={disabled}
                        loadingText={determineLoadingText()}
                        loading={loading?.broadcast || loading?.fulfill || loading?.trade}
                        onClick={onClick}
                        checkNetwork
                        form="submit"
                    >
                        {determineButtonText()}
                    </Button>
                </div>
            </>
        );
    }
};
