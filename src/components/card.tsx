import { ReactNode } from 'react';

type ICardProps = {
    children: ReactNode | string;
    className?: string;
    header?: string;
};

export const Card = ({ children, className, header }: ICardProps) => {
    return (
        <div className={`flex flex-col bg-neutral-900 p-4 lg:px-6 rounded-lg shadow ${className}`}>
            {header && <h3 className="text-xl text-center mb-3 lg:mb-4 font-semibold">{header}</h3>}
            {children}
        </div>
    );
};
