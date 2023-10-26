import { ChangeEventHandler, ReactNode, useEffect, useMemo, useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { convertAmount, percentChange, percentFormatter, toAddress } from '../../utils';
import { SmartPrice, SelectCoin, Skeleton, Percent } from '../components';
import { usePintswapContext, usePricesContext } from '../../stores';
import { getUsdPrice, useSubgraph } from '../../hooks';
import { ZeroAddress } from 'ethers6';
import { IOffer } from '@pintswap/sdk';

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
}: ICoinInput) => {
    const [open, setOpen] = useState(false);
    const [percent, setPercent] = useState('0');
    const { address } = useAccount();
    const {
        pintswap: { chainId },
    } = usePintswapContext();
    const { eth } = usePricesContext();
    const balance = useBalance(
        asset?.toUpperCase() === 'ETH'
            ? { address }
            : { token: toAddress(asset || '', chainId) as any, address },
    );
    const { data, isLoading } = useSubgraph({
        address: toAddress(asset, chainId),
    });

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
            ? (Number(value) * Number(data?.usdPrice || '0')).toString()
            : '0.00';
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
                const usdPrice = await getUsdPrice(trade.gives.token, eth);
                const actualAmount = Number(trade.gives.amount) * Number(usdPrice);
                setPercent(percentChange(renderInputUsd(), actualAmount));
            })().catch((err) => console.error(err));
        }
    }, [value, asset]);

    return (
        <div className="w-full bg-neutral-900 px-2 lg:px-3 pb-2 pt-1 rounded-lg shadow-inner shadow-black">
            {label && <span className="text-xs text-gray-400">{label}</span>}
            <div className="flex justify-between items-center gap-0.5 pt-4 pb-1">
                <input
                    className="text-2xl outline-none ring-0 bg-neutral-900 remove-arrow max-w-[180px] sm:max-w-none min-w-0 w-fit"
                    placeholder="0"
                    type="number"
                    onChange={onAmountChange}
                    value={value}
                    disabled={disabled}
                    id={id}
                />
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
                <small className="text-gray-400 flex items-center gap-0.5">
                    <span>$</span>
                    <Skeleton loading={isLoading && Number(value) !== 0} innerClass="!px-1">
                        <span className="flex items-center gap-1">
                            <SmartPrice price={renderInputUsd()} />
                            {trade &&
                                !isLoading &&
                                value &&
                                trade.gives.amount &&
                                trade.gives.token && <Percent value={percent} parentheses />}
                        </span>
                    </Skeleton>
                </small>
                <small>
                    {max && (
                        <button
                            className="p-0.5 group text-neutral-400"
                            onClick={() => {
                                const amount = {
                                    currentTarget: {
                                        value: value === determineMax() ? '0' : determineMax(),
                                    },
                                };
                                onAmountChange(amount as any);
                            }}
                        >
                            MAX:{' '}
                            <span className="text-primary group-hover:text-primary-hover transition duration-100">
                                <SmartPrice price={determineMax() || '0'} />
                            </span>
                        </button>
                    )}
                </small>
            </div>
        </div>
    );
};
