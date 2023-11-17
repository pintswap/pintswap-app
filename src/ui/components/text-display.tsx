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
    direction?: 'vertical' | 'horizontal';
};

export const TextDisplay = ({
    label,
    value,
    size,
    usdValue,
    align = 'left',
    loading,
    direction = 'horizontal',
}: ITextDisplayProps) => {
    const determineAlign = () => {
        switch (align) {
            case 'right':
                return `text-right ${direction !== 'vertical' ? 'justify-end' : ''}`;
            default:
                return '';
        }
    };
    const determineDirection = () => {
        switch (direction) {
            case 'vertical':
                return 'flex-col leading-none';
            default:
                return 'flex-row gap-1.5';
        }
    };
    return (
        <div className={`flex flex-col ${determineAlign()}`}>
            <span className="text-xs text-neutral-500">{label}</span>
            <Skeleton loading={loading} rounding="rounded" innerClass="!px-0">
                <span className={`flex ${determineDirection()} ${determineAlign()}`}>
                    <span
                        className={`${size || 'text-lg'} ${
                            direction === 'vertical' ? '!leading-none mt-1' : ''
                        }`}
                    >
                        {value}
                    </span>
                    {usdValue && !loading && (
                        <span
                            className={`inline items-center text-neutral-300 ${determineAlign()} ${
                                direction === 'vertical' ? 'text-xs' : ''
                            }`}
                        >
                            (<span className="text-xs">$</span>
                            <SmartPrice price={usdValue} />)
                        </span>
                    )}
                </span>
            </Skeleton>
        </div>
    );
};
