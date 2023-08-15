import { ReactNode } from 'react';
import { Tooltip } from 'react-tooltip';

type ITooltipWrapper = {
    text: string;
    position?: 'top' | 'right' | 'left' | 'bottom';
    children: ReactNode | string;
    id: string;
};

export const TooltipWrapper = ({ text, position = 'top', children, id }: ITooltipWrapper) => {
    return (
        <>
            <span data-tooltip-id={id} data-tooltip-content={text} className="z-[999999]">
                {children}
            </span>
            <Tooltip id={id} place={position} className="z-[999999]" />
        </>
    );
};
