import { ChangeEventHandler, useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { toAddress } from '../../utils';
import { SmartPrice, SelectCoin, Skeleton } from '../components';
import { usePintswapContext } from '../../stores';
import { useSubgraph } from '../../hooks';

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
}: ICoinInput) => {
    const [open, setOpen] = useState(false);
    const { address } = useAccount();
    const {
        pintswap: { chainId },
    } = usePintswapContext();
    const balance = useBalance(
        asset === 'ETH' ? { address } : { token: toAddress(asset || '', chainId) as any, address },
    );
    const { data, isLoading } = useSubgraph({
        address: toAddress(asset, chainId),
    });

    function clickAndClose(e: any) {
        onAssetClick(e);
        setOpen(false);
    }

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
                    disabled={disabled}
                    type={type}
                />
            </div>
            <div className="w-full flex justify-between items-center">
                <small className="text-gray-400 flex items-center gap-0.5">
                    <span>$</span>
                    <Skeleton loading={isLoading} innerClass="!px-1">
                        <SmartPrice
                            price={
                                Number(value) > 0 && asset
                                    ? Number(value) * Number(data?.usdPrice || '0')
                                    : '0.00'
                            }
                        />
                    </Skeleton>
                </small>
                <small>
                    {max && (
                        <button
                            className="p-0.5 group text-neutral-400"
                            onClick={() => {
                                const amount = {
                                    currentTarget: {
                                        value:
                                            value === maxAmount || balance?.data?.formatted
                                                ? '0'
                                                : maxAmount || balance?.data?.formatted,
                                    },
                                };
                                onAmountChange(amount as any);
                            }}
                        >
                            MAX:{' '}
                            <span className="text-primary group-hover:text-primary-hover transition duration-100">
                                <SmartPrice price={maxAmount || balance?.data?.formatted || '0'} />
                            </span>
                        </button>
                    )}
                </small>
            </div>
        </div>
    );
};
