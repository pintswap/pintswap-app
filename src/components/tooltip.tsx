import { ReactNode } from 'react';
import { Tooltip } from 'react-tooltip';

type ITooltipWrapper = {
    text: string;
    position?: 'top' | 'right' | 'left' | 'bottom';
    children: ReactNode | string;
    id: string;
    wrapperClass?: string;
};

export const TooltipWrapper = ({
    text,
    position = 'top',
    children,
    id,
    wrapperClass,
}: ITooltipWrapper) => {
    return (
        <>
            <span
                data-tooltip-id={id}
                data-tooltip-content={text}
                className={`z-[999] leading-[1] ${wrapperClass}`}
            >
                {children}
            </span>
            <Tooltip id={id} place={position} className="z-[999]" />
        </>
    );
};
