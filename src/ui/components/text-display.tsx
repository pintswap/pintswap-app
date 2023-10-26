import { ReactNode } from 'react';
import { SmartPrice } from './smart-price';

type ITextDisplayProps = {
    label?: string;
    value: string | number | ReactNode;
    size?: `text-${string}`;
    usdValue?: string | number;
    align?: 'left' | 'right';
};

export const TextDisplay = ({
    label,
    value,
    size,
    usdValue,
    align = 'left',
}: ITextDisplayProps) => {
    const determineAlign = () => {};
    return (
        <div className={`flex flex-col ${align === 'right' ? 'justify-end text-right' : ''}`}>
            <span className="text-xs text-neutral-500">{label}</span>
            <span
                className={`flex items-center gap-3 ${
                    align === 'right' ? 'justify-end text-right' : ''
                }`}
            >
                <span className={`${size || 'text-lg'} `}>{value}</span>
                {usdValue && (
                    <span className="flex items-center text-neutral-300">
                        (<span className="text-xs">$</span>
                        <SmartPrice price={usdValue} />)
                    </span>
                )}
            </span>
        </div>
    );
};
