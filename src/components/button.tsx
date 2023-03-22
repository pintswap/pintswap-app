import { MouseEventHandler, ReactNode } from 'react';

type IButtonProps = {
    children: ReactNode | string;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    className?: string;
};

export const Button = ({ children, onClick, className }: IButtonProps) => {
    return (
        <button
            onClick={onClick}
            className={`${className} bg-sky-800 px-2.5 py-1.5 lg:px-4 lg:py-2.5 rounded shadow transition duration-150 hover:bg-sky-900`}
        >
            {children}
        </button>
    );
};
