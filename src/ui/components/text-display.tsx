import { ReactNode } from 'react';
import { SmartPrice } from './smart-price';
import { Skeleton } from './skeleton';

type ITextDisplayProps = {
    label?: string;
    value: string | number | ReactNode;
    size?: `text-${string}`;
    usdValue?: string | number;
    align?: 'left' | 'right';
    loading?: boolean | undefined;
};

export const TextDisplay = ({
    label,
    value,
    size,
    usdValue,
    align = 'left',
    loading,
}: ITextDisplayProps) => {
    const determineAlign = () => {};
    return (
        <div className={`flex flex-col ${align === 'right' ? 'justify-end text-right' : ''}`}>
            <span className="text-xs text-neutral-500">{label}</span>
            <Skeleton loading={loading} rounding="rounded" innerClass="!px-0">
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
            </Skeleton>
        </div>
    );
};
