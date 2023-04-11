import { CopyToClipboard } from 'react-copy-to-clipboard';
import { MdContentCopy } from 'react-icons/md';
import { Button } from './button';
import { truncate as _truncate } from '../utils/common';

type ICopyClipboardProps = {
    icon?: boolean;
    value: string;
    lg?: boolean;
    truncate?: number;
};

export const CopyClipboard = ({ icon, value, lg, truncate }: ICopyClipboardProps) => {
    return (
        <CopyToClipboard text={value}>
            <Button className={`mx-auto ${lg ? 'text-lg' : ''}`} type="transparent">
                <span>{truncate ? _truncate(value, truncate) : value}</span>
                {icon && <MdContentCopy />}
            </Button>
        </CopyToClipboard>
    );
};
