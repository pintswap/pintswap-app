import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

type IActiveTextProps = {
    children: string | ReactNode;
    className?: string;
    route: string;
};

export const ActiveText = ({ children, className, route }: IActiveTextProps) => {
    const { pathname } = useLocation();
    return (
        <span
            className={`${
                pathname.includes(route)
                    ? className
                        ? className
                        : 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-sky-400'
                    : ''
            }`}
        >
            {children}
        </span>
    );
};
