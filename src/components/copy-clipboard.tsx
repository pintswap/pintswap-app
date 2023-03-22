import { CopyToClipboard } from 'react-copy-to-clipboard';
import { MdContentCopy } from 'react-icons/md';

type ICopyClipboardProps = {
    icon?: boolean;
    value: string;
    lg?: boolean;
};

export const CopyClipboard = ({ icon, value, lg }: ICopyClipboardProps) => {
    return (
        <CopyToClipboard text={value}>
            <button
                className={`flex items-center gap-2 mx-auto transition duration-150 hover:text-neutral-300 ${
                    lg ? 'text-lg' : ''
                }`}
            >
                <span>{value}</span>
                {icon && <MdContentCopy />}
            </button>
        </CopyToClipboard>
    );
};
