import { MouseEventHandler, ReactNode } from 'react';

type IButtonProps = {
    children: ReactNode | string;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    className?: string;
    type?: 'outline' | 'primary' | 'transparent';
};

export const Button = ({ children, onClick, className, type }: IButtonProps) => {
    const renderType = () => {
        switch (type) {
            case 'outline':
                return 'bg-gray-900';
            case 'transparent':
                return '!border-0 !bg-transparent hover:text-neutral-300 !p-0';
            default:
                return 'bg-indigo-800 hover:bg-indigo-900';
        }
    };
    return (
        <button
            onClick={onClick}
            className={`${className} ${renderType()} px-2.5 py-1.5 lg:px-4 lg:py-2.5 rounded shadow transition duration-150 border-2 border-indigo-800 hover:border-indigo-900 flex items-center gap-2 text-center justify-center`}
        >
            {children}
        </button>
    );
};
