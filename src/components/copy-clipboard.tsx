import { CopyToClipboard } from 'react-copy-to-clipboard';
import { MdContentCopy } from 'react-icons/md';
import { Button } from './button';
import { truncate as _truncate } from '../utils/format';
import { ReactNode, useState } from 'react';
import { Tooltip } from 'react-tooltip';

type ICopyClipboardProps = {
    icon?: boolean;
    value: string;
    lg?: boolean;
    truncate?: number;
    children?: ReactNode;
};

export const CopyClipboard = ({ icon, value, lg, truncate, children }: ICopyClipboardProps) => {
    const [tooltipOpen, setTooltipOpen] = useState(false);

    const toggleTooltip = () => {
        if (!tooltipOpen) {
            setTooltipOpen(true);
            setTimeout(() => setTooltipOpen(false), 1000);
        } else {
            setTooltipOpen(false);
        }
    };

    return (
        <>
            {children ? (
                <CopyToClipboard
                    text={value}
                    data-tooltip-id="clipboard-copy-click"
                    onCopy={toggleTooltip}
                >
                    <div className="hover:cursor-pointer hover:text-neutral-300 transition duration-200 flex items-center gap-1 md:gap-2">
                        {children}
                        {icon && <MdContentCopy />}
                    </div>
                </CopyToClipboard>
            ) : (
                <CopyToClipboard
                    text={value}
                    data-tooltip-id="clipboard-copy-click"
                    onCopy={toggleTooltip}
                >
                    <Button className={`mx-auto ${lg ? 'text-lg' : ''}`} type="transparent">
                        <span>{truncate ? _truncate(value, truncate) : value}</span>
                        {icon && <MdContentCopy />}
                    </Button>
                </CopyToClipboard>
            )}
            <Tooltip
                className="!z-[999999999]"
                id="clipboard-copy-click"
                content="Copied!"
                isOpen={tooltipOpen}
            />
        </>
    );
};
