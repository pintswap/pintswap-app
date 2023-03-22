import { MouseEventHandler, ReactNode } from 'react';

type IButtonProps = {
    children: ReactNode | string;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    className?: string;
    type?: 'outline' | 'primary';
};

export const Button = ({ children, onClick, className, type }: IButtonProps) => {
    const renderType = () => {
        switch (type) {
            case 'outline':
                return 'bg-gray-900';
            default:
                return 'bg-indigo-800 hover:bg-indigo-900';
        }
    };
    return (
        <button
            onClick={onClick}
            className={`${className} ${renderType()} px-2.5 py-1.5 lg:px-4 lg:py-2.5 rounded shadow transition duration-150 border-2 border-indigo-800 hover:border-indigo-900`}
        >
            {children}
        </button>
    );
};
