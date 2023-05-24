import { CopyToClipboard } from 'react-copy-to-clipboard';
import { MdContentCopy } from 'react-icons/md';
import { Button } from './button';
import { truncate as _truncate } from '../utils/common';
import { ReactNode } from 'react';

type ICopyClipboardProps = {
    icon?: boolean;
    value: string;
    lg?: boolean;
    truncate?: number;
    children?: ReactNode
};

export const CopyClipboard = ({ icon, value, lg, truncate, children }: ICopyClipboardProps) => {
    if(children) {
        return (
            <CopyToClipboard text={value}>
                <div className="hover:cursor-pointer hover:text-neutral-300 transition duration-200 flex items-center gap-1 md:gap-2">
                    {children}
                    {icon && <MdContentCopy />}
                </div>
            </CopyToClipboard>
        );
    } else {
        return (
            <CopyToClipboard text={value}>
                <Button className={`mx-auto ${lg ? 'text-lg' : ''}`} type="transparent">
                    <span>{truncate ? _truncate(value, truncate) : value}</span>
                    {icon && <MdContentCopy />}
                </Button>
            </CopyToClipboard>
        );
    }
};
