import { FormEvent } from 'react';
import { useBalance } from 'wagmi';

type IInputProps = {
    placeholder?: string;
    value: string;
    onChange?: (e: FormEvent<HTMLInputElement>) => void;
    className?: string;
    max?: number;
    type?: 'text' | 'number';
    title?: string;
    disabled?: boolean;
    loading?: boolean;
    token?: string | any;
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
    token
}: IInputProps) => {
    return (
        <div className="flex flex-col gap-1 justify-end">
            {title ? <p className="text-sm">{title}</p> : <div className="w-full lg:h-5" />}
            <input
                className={`p-2 bg-neutral-600 rounded ${className} ${type === 'number' ? 'text-right' : ''}`}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                maxLength={max}
                type={type}
                disabled={disabled}
            />
            {token && <button className="text-xs text-indigo-600 text-right">MAX: {'0.00'}</button>}
        </div>
    );
};
