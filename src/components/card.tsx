import { ReactNode } from 'react';

type ICardProps = {
    children: ReactNode | string;
    className?: string;
};

export const Card = ({ children, className }: ICardProps) => {
    return (
        <div className={`flex flex-col bg-neutral-900 p-4 lg:px-6 rounded-lg shadow ${className}`}>
            {children}
        </div>
    );
};
