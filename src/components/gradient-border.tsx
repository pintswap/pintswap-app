import { ReactNode } from 'react';

type IGradiantBorder = {
    width?: string;
    children: ReactNode;
    className?: string;
    hover?: boolean;
};

export const GradientBorder = (props: IGradiantBorder) => {
    return (
        <div
            className={`${props.width || 'p-0.5'} ${
                props.className ? props.className : ''
            } bg-gradient-to-tr to-indigo-500 from-sky-400 hover:bg-gradient-to-tr hover:to-indigo-500 hover:from-sky-400`}
        >
            {props.children}
        </div>
    );
};
