import { ChangeEventHandler, useEffect, useState } from 'react';
import { useWindowSize } from '../../hooks';
import { getName, getTotalSupply } from '../../utils';
import { usePintswapContext } from '../../stores';

type INFTInput = {
    label?: string;
    value?: string;
    onAddressChange: ChangeEventHandler<HTMLInputElement>;
    nftId?: string;
    disabled?: boolean;
    id?: string;
    onNftIdChange?: any;
};

export const NFTInput = ({
    label,
    value,
    onAddressChange,
    onNftIdChange,
    nftId,
    disabled,
    id,
}: INFTInput) => {
    const {
        pintswap: { chainId },
    } = usePintswapContext();
    const { width, breakpoints } = useWindowSize();
    const [invalid, setInvalid] = useState('');
    const [meta, setMeta] = useState({ name: '', totalSupply: '' });
    useEffect(() => {
        if (value) {
            if (nftId) {
                (async () => {
                    const promises = await Promise.all([
                        await getName(value, chainId),
                        await getTotalSupply(value, chainId),
                    ]);
                    setMeta({
                        totalSupply: promises[1],
                        name: promises[0],
                    });
                    if (promises[1] === '0' && promises[0] === '0')
                        setInvalid('Error finding contract');
                })().catch((err) => {
                    console.error(err);
                    setInvalid('Error finding contract');
                });
            }
        }
    }, [value, nftId]);
    return (
        <div className="w-full bg-neutral-900 px-2 lg:px-3 pb-2 pt-1 rounded-lg shadow-inner shadow-black">
            {label && <span className="text-xs text-gray-400">{label}</span>}
            <div className="flex justify-between items-center gap-4 pt-4 pb-1">
                <input
                    className="text-lg outline-none ring-0 bg-neutral-900 remove-arrow min-w-0 truncate w-full py-0.5"
                    placeholder={width > breakpoints.sm ? 'Contract Address' : 'Address'}
                    type="string"
                    onChange={onAddressChange}
                    value={value}
                    disabled={disabled}
                    id={id}
                />
                <input
                    className="text-lg outline-none ring-0 bg-neutral-900 min-w-0 w-fit max-w-[80px] sm:max-w-[100px] !text-right py-0.5"
                    placeholder={'NFT ID'}
                    type="number"
                    onChange={onNftIdChange}
                    value={nftId}
                    disabled={disabled}
                    id={`${id}-id`}
                />
            </div>
            <div className="w-full flex justify-between items-center">
                <small
                    className={`${
                        invalid ? 'text-red-400' : 'text-gray-400'
                    } flex items-center gap-0.5`}
                >
                    {invalid || meta.name === '0' ? invalid : meta.name || '-'}
                </small>
            </div>
        </div>
    );
};
