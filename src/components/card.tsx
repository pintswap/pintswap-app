import { Skeleton } from '@mui/material';
import { ReactNode } from 'react';

type ICardProps = {
    children: ReactNode | string;
    className?: string;
    header?: string | ReactNode;
    scroll?: boolean;
    type?: 'default' | 'skeleton';
};

export const Card = ({ children, className, header, scroll, type }: ICardProps) => {
    if(type === 'skeleton') {
        return (
            <div role="status" className="w-full animate-pulse">
                <div className={`${className ? className : ''} bg-neutral-800 h-[5rem] rounded-lg shadow w-full`}></div>
            </div>
        )
    }
    return (
        <div
            className={`flex flex-col bg-neutral-900 pt-3 p-4 lg:px-6 rounded-lg shadow w-full transition duration-200 ${className}`}
        >
            {header && <h3 className="text-xl text-center mb-4 lg:mb-6 font-semibold">{header}</h3>}
            <div className={`w-full ${scroll ? 'overflow-y-auto max-h-[60vh]' : ''}`}>
                {children}
            </div>
        </div>
    );
};
