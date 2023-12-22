import { ChangeEventHandler, ReactNode, useEffect, useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { getChainId, percentChange, toAddress } from '../../utils';
import { SmartPrice, SelectCoin, Skeleton, ChangeDisplay } from '../components';
import { useOffersContext, usePintswapContext } from '../../stores';
import { useUsdPrice } from '../../hooks';
import { IOffer } from '@pintswap/sdk';
import { useLocation } from 'react-router-dom';
import { ZeroAddress } from 'ethers6';

type ICoinInput = {
    label?: string;
    value?: string;
    onAmountChange: ChangeEventHandler<HTMLInputElement>;
    onAssetClick?: any;
    asset?: string;
    max?: boolean;
    disabled?: boolean;
    type?: 'swap' | 'fulfill';
    id?: string;
    maxAmount?: string;
    trade?: IOffer;
    noSelect?: boolean;
    customButton?: ReactNode;
    change?: string;
    maxLoading?: boolean;
    loading?: boolean;
    maxText?: string;
};

export const CoinInput = ({
    label,
    value,
    onAmountChange,
    onAssetClick,
    asset,
    max,
    disabled,
    type = 'swap',
    id,
    maxAmount,
    trade,
    noSelect,
    customButton,
    change,
    maxLoading,
    loading,
    maxText,
}: ICoinInput) => {
    const [open, setOpen] = useState(false);
    const [percent, setPercent] = useState('0');
    const { pathname } = useLocation();
    const { address } = useAccount();
    const chainId = getChainId();
    const { allOffers } = useOffersContext();
    const balance = useBalance(
        asset?.toUpperCase() === 'ETH' || asset?.toUpperCase() === 'AVAX' || asset === ZeroAddress
            ? { address }
            : { token: toAddress(asset || '', chainId) as any, address, watch: true },
    );
    const usdPrice = useUsdPrice(asset);
    const givesUsdPrice = useUsdPrice(trade?.gives.token);

    function clickAndClose(e: any) {
        onAssetClick(e);
        setOpen(false);
    }

    function determineMax() {
        if (maxAmount) return maxAmount;
        return balance?.data?.formatted;
    }

    function renderInputUsd() {
        return Number(value) > 0 && asset
            ? (Number(value) * Number(usdPrice || '0')).toString()
            : '0.00';
    }

    function isLoadingMax() {
        if (maxLoading !== undefined) return maxLoading;
        return (
            balance.isLoading ||
            maxAmount === '0' ||
            (!allOffers.erc20?.length &&
                !pathname.includes('create') &&
                !pathname.includes('staking'))
        );
    }

    useEffect(() => {
        if (
            trade &&
            trade.gives?.token &&
            trade.gives?.amount &&
            asset &&
            value &&
            value.length > 1
        ) {
            (async () => {
                const actualAmount = Number(trade.gives.amount) * Number(givesUsdPrice);
                setPercent(percentChange(renderInputUsd(), actualAmount));
            })().catch((err) => console.error(err));
        }
    }, [value, asset]);

    return (
        <div className="w-full bg-neutral-900 px-2 lg:px-3 pb-2 pt-1 rounded-lg shadow-inner shadow-black">
            {label && <span className="text-xs text-gray-400">{label}</span>}
            <div className="flex justify-between items-center gap-0.5 pt-4 pb-1">
                <Skeleton loading={loading} innerClass="!p-0 min-w-[160px] min-h-[28px]">
                    {loading ? (
                        <span className="h-full text-2xl outline-none ring-0 bg-neutral-900 remove-arrow max-w-[180px] md:max-w-[240px] 2xl:max-w-[280px] min-w-0 w-fit" />
                    ) : (
                        <input
                            className="text-2xl outline-none ring-0 bg-neutral-900 remove-arrow max-w-[180px] md:max-w-[240px] 2xl:max-w-[280px] min-w-0 w-fit"
                            placeholder="0"
                            type="number"
                            onChange={onAmountChange}
                            value={value}
                            disabled={disabled}
                            id={id}
                        />
                    )}
                </Skeleton>
                <SelectCoin
                    asset={asset}
                    onAssetClick={clickAndClose}
                    modalOpen={open}
                    setModalOpen={setOpen}
                    disabled={disabled || noSelect}
                    type={type}
                    noSelect={noSelect}
                    customButton={customButton}
                />
            </div>
            <div className="w-full flex justify-between items-center">
                {/* TODO: fix for all chains */}
                <small className="text-gray-400 flex items-center gap-0.5">
                    {chainId === 1 ? (
                        <>
                            <span>$</span>
                            <Skeleton
                                loading={(!usdPrice && Number(value) !== 0) || loading}
                                innerClass="!px-1"
                            >
                                <span className="flex items-center gap-1">
                                    <SmartPrice price={renderInputUsd()} />
                                    {change && Number(change) > 1 && (
                                        <span className="text-xs text-green-400">
                                            ( +{Number(change).toFixed(2)} {asset} )
                                        </span>
                                    )}
                                    {trade &&
                                        !usdPrice &&
                                        value &&
                                        trade.gives.amount &&
                                        trade.gives.token && (
                                            <ChangeDisplay value={percent} parentheses percent />
                                        )}
                                </span>
                            </Skeleton>
                        </>
                    ) : (
                        <span>-</span>
                    )}
                </small>
                <small>
                    {max && (
                        <button
                            onClick={() => {
                                const amount = {
                                    currentTarget: {
                                        value: value === determineMax() ? '' : determineMax(),
                                    },
                                };
                                onAmountChange(amount as any);
                            }}
                            className=" group text-neutral-400 p-0.5 flex items-center gap-1"
                        >
                            {maxText ? maxText : 'MAX'}
                            {': '}
                            <Skeleton innerClass="!p-0 min-w-[24px]" loading={isLoadingMax()}>
                                <span
                                    className={`${
                                        isLoadingMax() ? 'opacity-0' : ''
                                    } transition duration-100 text-primary group-hover:text-primary-hover`}
                                >
                                    <SmartPrice price={determineMax() || '0'} />
                                </span>
                            </Skeleton>
                        </button>
                    )}
                </small>
            </div>
        </div>
    );
};
