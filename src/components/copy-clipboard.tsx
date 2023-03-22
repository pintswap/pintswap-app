import { CopyToClipboard } from 'react-copy-to-clipboard';
import { MdContentCopy } from 'react-icons/md';
import { Button } from './button';

type ICopyClipboardProps = {
    icon?: boolean;
    value: string;
    lg?: boolean;
};

export const CopyClipboard = ({ icon, value, lg }: ICopyClipboardProps) => {
    return (
        <CopyToClipboard text={value}>
            <Button className={`mx-auto ${lg ? 'text-lg' : ''}`} type="transparent">
                <span>{value}</span>
                {icon && <MdContentCopy />}
            </Button>
        </CopyToClipboard>
    );
};
