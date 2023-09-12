import { ChangeEventHandler, useState } from 'react';
import { SelectCoin } from './select-coin';
import { useAccount, useBalance } from 'wagmi';
import { DEFAULT_CHAINID, toAddress } from '../utils';
import { getNetwork } from '@wagmi/core';
import { SmartPrice } from './smart-price';
import { usePintswapContext } from '../stores';

type ICoinInput = {
    label?: string;
    value?: string;
    onAmountChange: ChangeEventHandler<HTMLInputElement>;
    onAssetClick?: any;
    asset?: string;
    max?: boolean;
    fairValue?: string;
};

export const CoinInput = ({
    label,
    value,
    onAmountChange,
    onAssetClick,
    asset,
    max,
    fairValue,
}: ICoinInput) => {
    const [open, setOpen] = useState(false);
    const { address } = useAccount();
    const {
        pintswap: { chainId },
    } = usePintswapContext();
    const balance = useBalance(
        asset === 'ETH' ? { address } : { token: toAddress(asset || '', chainId) as any, address },
    );

    function clickAndClose(e: any) {
        onAssetClick(e);
        setOpen(false);
    }

    return (
        <div className="w-full bg-neutral-900 px-2 lg:px-3 pb-2 pt-1 rounded-lg shadow-inner shadow-black">
            {label && <span className="text-xs text-gray-400">{label}</span>}
            <div className="flex justify-between items-center gap-0.5 pt-4 pb-1">
                <input
                    className="text-2xl outline-none ring-0 bg-neutral-900 remove-arrow min-w-0 w-fit"
                    placeholder="0"
                    type="number"
                    onChange={onAmountChange}
                    value={value}
                />
                <SelectCoin
                    asset={asset}
                    onAssetClick={clickAndClose}
                    modalOpen={open}
                    setModalOpen={setOpen}
                />
            </div>
            {max ? (
                <div className="w-full flex justify-end">
                    <small>
                        <button
                            className="pt-1 pr-0.5 text-indigo-600 hover:text-indigo-500 transition duration-100"
                            onClick={() => {
                                const amount = {
                                    currentTarget: {
                                        value:
                                            value === balance?.data?.formatted
                                                ? '0'
                                                : balance?.data?.formatted,
                                    },
                                };
                                onAmountChange(amount as any);
                            }}
                        >
                            MAX: <SmartPrice price={balance?.data?.formatted || '0'} />
                        </button>
                    </small>
                </div>
            ) : fairValue ? (
                // TODO
                <div className="w-full flex justify-end">
                    <small>
                        <button
                            className="pt-1 pr-0.5 text-indigo-600 hover:text-indigo-500 transition duration-100"
                            onClick={() => {}}
                        >
                            FAIR VALUE: <SmartPrice price={'0'} />
                        </button>
                    </small>
                </div>
            ) : (
                <div className="h-[23px]" />
            )}
        </div>
    );
};
