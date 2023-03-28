import { FormEvent } from 'react';

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
    loading
}: IInputProps) => {
    return (
        <div className="flex flex-col gap-1 justify-end">
            {title && <p className="text-sm">{title}</p>}
            <input
                className={`p-2 bg-neutral-600 rounded ${className} ${type === 'number' ? 'text-right' : ''}`}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                maxLength={max}
                type={type}
                disabled={disabled}
            />
        </div>
    );
};
