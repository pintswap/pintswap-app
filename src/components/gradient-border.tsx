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
            } transition duration-100 bg-gradient-to-tr to-primary from-accent-light hover:bg-gradient-to-tr hover:to-primary hover:from-accent-light`}
        >
            {props.children}
        </div>
    );
};
