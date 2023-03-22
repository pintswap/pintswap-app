import { ReactNode } from 'react';

type ICardProps = {
    children: ReactNode | string;
    className?: string;
    header?: string;
    scroll?: boolean;
};

export const Card = ({ children, className, header, scroll }: ICardProps) => {
    return (
        <div className={`flex flex-col bg-neutral-900 p-4 lg:px-6 rounded-lg shadow ${className}`}>
            {header && <h3 className="text-xl text-center mb-4 lg:mb-6 font-semibold">{header}</h3>}
            <div className={`w-full ${scroll ? 'overflow-y-auto max-h-[50vh]' : ''}`}>
                {children}
            </div>
        </div>
    );
};
