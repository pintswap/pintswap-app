import { FormEvent, useEffect, useState } from 'react';
import { fetchBalance } from '@wagmi/core'
import { useAccount } from 'wagmi';
import { Skeleton } from './skeleton';
import { getTokenAttributes, round } from '../utils/common';

type IInputProps = {
    placeholder?: string;
    value: string;
    onChange?: (e: FormEvent<HTMLInputElement>) => void;
    className?: string;
    max?: number;
    type?: 'text' | 'number' | 'password';
    title?: string;
    disabled?: boolean;
    loading?: boolean;
    token?: string | any;
    maxClick?: (key: 'gives.token' | 'gets.token' | 'gives.amount' | 'gets.amount', val: string) => void;
    noSpace?: boolean;
    enableStateCss?: boolean;
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
    enableStateCss
}: IInputProps) => {
    const { address } = useAccount();
    const [balance, setBalance] = useState({ loading: false, formatted: '0.00', symbol: '' });
    const tradeObjKey = placeholder?.includes('Receive') ? 'gets.amount' : 'gives.amount';

    useEffect(() => {
        const getBalance = async () => {
            setBalance({ ...balance, loading: true });
            try {
                if(address) {
                    const params = token === 'ETH' ? 
                        { address } : 
                        { address, token: (getTokenAttributes(token, 'address') as string) || token }
                    const { formatted, symbol } = await fetchBalance(params)
                    if(formatted) setBalance({ loading: false, formatted, symbol });
                }
            } catch (err) {
                setBalance({ ...balance, loading: false })
                console.error(`Error fetching balance:`, err)
            }
        }
        if(token && typeof token === 'string') getBalance()
    }, [token])

    return (
        <div className="flex flex-col gap-1 justify-end">
            {title ? <p className="text-sm">{title}</p> : !noSpace && <div className="w-full md:h-5" />}
            <input
                className={`p-2 bg-neutral-600 ${enableStateCss ? 'disabled:bg-neutral-900' : ''} rounded ${className} ${type === 'number' ? 'text-right' : ''} ${loading ? 'animate-pulse' : ''}`}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                maxLength={max}
                type={type}
                disabled={disabled}
            />
            {token && maxClick && (
                <button className="text-xs text-indigo-600 transition duration-200 hover:text-indigo-700 text-right flex gap-1 justify-end" onClick={() => maxClick(tradeObjKey, balance.formatted)}>
                    MAX: 
                    <Skeleton loading={balance.loading}>
                        {round(balance.formatted, 6)} {balance.symbol}
                    </Skeleton>
                </button>
            )}
        </div>
    );
};
