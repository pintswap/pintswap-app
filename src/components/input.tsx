import { ChangeEvent, useEffect, useState } from 'react';
import { fetchBalance } from '@wagmi/core';
import { useAccount } from 'wagmi';
import { Skeleton } from './skeleton';
import { getTokenAttributes } from '../utils';
import { MdSearch } from 'react-icons/md';
import { usePintswapContext } from '../stores';

type IInputProps = {
    placeholder?: string;
    value: string;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    max?: number;
    type?: 'text' | 'number' | 'password' | 'search';
    title?: string;
    disabled?: boolean;
    loading?: boolean;
    token?: string | any;
    maxClick?: (
        key: 'gives.token' | 'gets.token' | 'gives.amount' | 'gets.amount',
        val: string,
    ) => void;
    noSpace?: boolean;
    enableStateCss?: boolean;
    wrapperClass?: string;
};

export const Input = ({
    placeholder,
    value,
    onChange,
    className,
    max,
    type = 'text',
    title,
    disabled,
    loading,
    token,
    maxClick,
    noSpace,
    enableStateCss,
    wrapperClass,
}: IInputProps) => {
    const { address } = useAccount();
    const {
        pintswap: { module },
    } = usePintswapContext();
    const [balance, setBalance] = useState({ loading: false, formatted: '0.00', symbol: '' });
    const tradeObjKey = placeholder?.includes('Receive') ? 'gets.amount' : 'gives.amount';

    useEffect(() => {
        const getBalance = async () => {
            setBalance({ ...balance, loading: true });
            try {
                if (address) {
                    const params =
                        token === 'ETH'
                            ? { address }
                            : {
                                  address,
                                  token:
                                      ((await getTokenAttributes(
                                          token,
                                          module?.signer,
                                          'address',
                                      )) as string) || token,
                              };
                    const { formatted, symbol } = await fetchBalance(params);
                    if (formatted) setBalance({ loading: false, formatted, symbol });
                }
            } catch (err) {
                setBalance({ ...balance, loading: false });
                console.error(`Error fetching balance:`, err);
            }
        };
        if (token && typeof token === 'string') getBalance();
    }, [token, module?.signer]);

    if (type === 'search') {
        return (
            <div
                className={`flex items-center gap-1 pl-2 bg-brand-dashboard border-2 border-neutral-800 hover:border-neutral-700 transition duration-150 ${
                    enableStateCss ? 'disabled:bg-neutral-900' : ''
                } rounded ${wrapperClass} ${loading ? 'animate-pulse' : ''}`}
            >
                <div className="w-[20px] h-[20px] flex justify-center items-center">
                    <MdSearch size="18px" className="text-neutral-200" />
                </div>
                <input
                    className={`bg-transparent outline-none ring-none p-2 ${className} min-w-0 group `}
                    value={value}
                    onChange={onChange}
                    placeholder={!placeholder ? 'Search here' : placeholder}
                    maxLength={max}
                    type={'text'}
                    disabled={disabled}
                />
            </div>
        );
    }
    return (
        <div className={`flex flex-col gap-1 justify-end w-full ${wrapperClass}`}>
            {title ? (
                <p className="text-xs md:text-sm">{title}</p>
            ) : (
                !noSpace && <div className="w-full md:h-5" />
            )}
            <input
                className={`flex items-center gap-1 p-2 bg-neutral-600 ${
                    enableStateCss ? 'disabled:bg-neutral-900' : ''
                } rounded ${className} ${type === 'number' ? 'text-right' : ''} ${
                    loading ? 'animate-pulse' : ''
                }`}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                maxLength={max}
                type={type}
                disabled={disabled}
            />
            {token && maxClick && (
                <button
                    className="text-xs text-indigo-600 transition duration-200 hover:text-indigo-700 text-right flex gap-1 justify-end"
                    onClick={() => maxClick(tradeObjKey, balance.formatted)}
                >
                    MAX:
                    <Skeleton loading={balance.loading}>
                        {balance.formatted} {balance.symbol}
                    </Skeleton>
                </button>
            )}
        </div>
    );
};
