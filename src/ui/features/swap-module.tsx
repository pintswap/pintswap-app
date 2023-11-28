import { MdArrowDownward } from 'react-icons/md';
import { IOffer } from '@pintswap/sdk';
import React, { MouseEventHandler, useEffect, useState } from 'react';
import { INFTProps, fetchNFT, toAddress, tokenTaxCache } from '../../utils';
import { Button, TxDetails } from '../components';
import { NFTInput, CoinInput } from '../features';
import { getQuote } from '../../api';
import { usePintswapContext, usePricesContext } from '../../stores';
import { useAccount, useBalance } from 'wagmi';
import { ZeroAddress } from 'ethers6';

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
    isPublic?: boolean;
    max?: string;
    autoQuote?: boolean;
    percentDiff?: boolean;
    buttonText?: string;
    raw?: IOffer;
    setFill?: React.Dispatch<React.SetStateAction<string>>;
    fill?: string;
    output?: { value: string; loading: boolean };
};

export const SwapModule = ({
    trade,
    loading,
    updateTrade,
    onClick,
    disabled,
    type = 'swap',
    isPublic = true,
    setTrade,
    max,
    autoQuote = true,
    percentDiff,
    buttonText,
    raw,
    output,
    setFill,
    fill,
}: ISwapModule) => {
    const { eth } = usePricesContext();
    const { address } = useAccount();
    const [nft, setNFT] = useState<INFTProps | null>(null);
    const [nftLoading, setNftLoading] = useState(false);
    const {
        pintswap: { chainId },
    } = usePintswapContext();
    const { data: givesWalletBalance } = useBalance(
        trade?.gives?.token === ZeroAddress ||
            !trade.gives?.token ||
            trade?.gives?.token?.toUpperCase() === 'ETH'
            ? { address, watch: true }
            : { token: toAddress(trade.gives.token, chainId) as any, address, watch: true },
    );
    const isBalanceInsufficient =
        givesWalletBalance && Number(givesWalletBalance.formatted) < Number(trade?.gives?.amount);

    const determineLoadingText = () => {
        if (loading?.broadcast || loading?.fulfill) return 'Swapping';
        if (loading?.trade) return 'Loading Offer';
        return 'Loading';
    };
    const determineButtonText = () => {
        if (buttonText) return buttonText;
        if (type === 'fulfill') {
            if (isBalanceInsufficient) return `Insufficient ${givesWalletBalance.symbol} Balance`;
            return 'Fulfill';
        }
        if (type === 'nft') {
            if (nft && nft.amount === '0') return 'Cannot verify NFT ownership';
            if (!nft) return 'Select NFT';
        }
        if (!trade.gets.token) return 'Select a Token';
        if (isBalanceInsufficient) return `Insufficient ${givesWalletBalance.symbol} Balance`;
        if (!isPublic) return 'Create Offer';
        if (!autoQuote) return 'Place Limit Order';
        return 'Swap';
    };

    if (type === 'nft') {
        const handleNftChange = (n: INFTProps) => {
            if (updateTrade) {
                updateTrade('gives.token', n.token);
                updateTrade('gives.tokenId', String(n.tokenId));
            }
        };

        useEffect(() => {
            (async () => {
                const { gives } = trade;
                if (gives.tokenId && gives.token) {
                    setNftLoading(true);
                    const n = await fetchNFT({
                        token: gives.token,
                        tokenId: gives.tokenId,
                        owner: address,
                    });
                    setNFT(n);
                    setNftLoading(false);
                }
                if (!gives.tokenId) {
                    setNFT(null);
                }
            })().catch((err) => console.error(err));
        }, [trade.gives.tokenId, trade.gives.token]);

        return (
            <div className="flex flex-col justify-center items-center gap-1.5">
                <NFTInput
                    label="You give"
                    onNftSelect={handleNftChange}
                    nftAddress={trade.gives?.token}
                    nftId={trade.gives?.tokenId}
                    nft={nft}
                    nftLoading={nftLoading}
                />
                <button
                    className={`absolute p-1.5 bg-brand-dashboard rounded-lg cursor-default mb-14`}
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
                    type={'swap'}
                    id="swap-module-get"
                />
                <Button
                    className="w-full rounded-lg !py-2.5 mt-0.5"
                    disabled={disabled || nft?.amount === '0'}
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
        const [isReversing, setIsReversing] = useState(false);
        const reverse = () => {
            setIsReversing(true);
            setTrade &&
                trade.gives.token &&
                trade.gets.token &&
                setTrade({
                    gets: trade.gives,
                    gives: trade.gets,
                });
            setTimeout(() => setIsReversing(false), 200);
        };

        useEffect(() => {
            if (!trade.gives.token && updateTrade) updateTrade('gives.token', 'ETH');
        }, [trade]);

        useEffect(() => {
            if (autoQuote) {
                (async () => {
                    const quote = await getQuote(trade, eth);
                    if (Number(quote) > 0 && updateTrade && !isReversing) {
                        updateTrade('gets.amount', quote);
                    } else if (Number(quote) === 0 && updateTrade) {
                        updateTrade('gets.amount', '');
                    }
                })().catch((err) => console.error(err));
            }
        }, [trade.gets.token, trade.gives.token, trade.gives.amount]);

        return (
            <>
                <div className="flex flex-col justify-center items-center gap-1.5">
                    <CoinInput
                        label="You give"
                        value={fill ? fill : trade.gives?.amount}
                        onAssetClick={(e: any) =>
                            updateTrade ? updateTrade('gives.token', e.target.innerText) : {}
                        }
                        onAmountChange={({ currentTarget }) => {
                            if (setFill) {
                                setFill(currentTarget.value);
                                return;
                            }
                            if (updateTrade) {
                                updateTrade('gives.amount', currentTarget.value);
                                return;
                            }
                        }}
                        asset={trade.gives?.token}
                        max={type === 'swap' || !!max}
                        maxAmount={max}
                        maxLoading={!!max && max === '-'}
                        type={type}
                        id="swap-module-give"
                    />

                    <button
                        className="absolute p-1.5 bg-brand-dashboard hover:bg-black transition duration-150 rounded-lg mt-1"
                        onClick={reverse}
                    >
                        <div className="bg-neutral-800 p-1 rounded-md">
                            <MdArrowDownward />
                        </div>
                    </button>
                    <CoinInput
                        label="You get"
                        value={output?.value || trade.gets?.amount}
                        onAssetClick={(e: any) =>
                            updateTrade ? updateTrade('gets.token', e.target.innerText) : {}
                        }
                        onAmountChange={({ currentTarget }) =>
                            updateTrade ? updateTrade('gets.amount', currentTarget.value) : {}
                        }
                        loading={output?.loading}
                        asset={trade.gets?.token}
                        disabled={!!setFill}
                        type={type}
                        id="swap-module-get"
                        trade={percentDiff ? trade : undefined}
                    />
                </div>

                <div className="flex flex-col gap-2 mt-2">
                    <TxDetails
                        trade={trade}
                        loading={typeof loading === 'boolean' ? loading : loading?.trade}
                        type="fulfill"
                        buyTax={tokenTaxCache[1][toAddress(trade?.gets?.token) || '']?.buy}
                        sellTax={tokenTaxCache[1][toAddress(trade?.gives?.token) || '']?.sell}
                    />
                    <Button
                        className="w-full rounded-lg !py-2.5"
                        disabled={disabled || isBalanceInsufficient}
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
