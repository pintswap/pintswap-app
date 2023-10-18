import { ReactNode } from 'react';

type ISkeletonProps = {
    children: ReactNode;
    loading?: boolean;
    rounding?:
        | 'rounded-full'
        | 'rounded-lg'
        | 'rounded-xl'
        | 'rounded-2xl'
        | 'rounded'
        | 'rounded-sm'
        | 'rounded-3xl';
    maxW?: `max-w${string}`;
    wrapperClass?: string;
};

export const Skeleton = ({
    children,
    loading,
    rounding = 'rounded-full',
    maxW,
    wrapperClass,
}: ISkeletonProps) => {
    return (
        <div role="status" className={`${loading ? 'animate-pulse' : ''} ${wrapperClass || ''}`}>
            <div
                className={`${rounding} ${maxW || ''} px-2 ${
                    loading ? 'bg-neutral-800 text-transparent' : ''
                }`}
            >
                {children}
            </div>
        </div>
    );
};
