import { CopyToClipboard } from 'react-copy-to-clipboard';
import { MdContentCopy } from 'react-icons/md';
import { Button } from './button';
import { truncate } from '../utils/common';

type ICopyClipboardProps = {
    icon?: boolean;
    value: string;
    lg?: boolean;
    isTruncated?: boolean;
};

export const CopyClipboard = ({ icon, value, lg, isTruncated }: ICopyClipboardProps) => {
    return (
        <CopyToClipboard text={value}>
            <Button className={`mx-auto ${lg ? 'text-lg' : ''}`} type="transparent">
                <span>{isTruncated ? truncate(value) : value}</span>
                {icon && <MdContentCopy />}
            </Button>
        </CopyToClipboard>
    );
};
