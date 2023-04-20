import { useChainModal } from '@rainbow-me/rainbowkit';
import { MouseEventHandler, ReactNode } from 'react';
import { ImSpinner9 } from 'react-icons/im';
import { useNetwork } from 'wagmi';
import { Avatar } from './avatar';

type IButtonProps = {
    children: ReactNode | string;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    className?: string;
    type?: 'outline' | 'primary' | 'transparent' | 'wallet';
    disabled?: boolean;
    loading?: boolean;
    loadingText?: string;
    form?: 'submit' | 'reset';
    checkNetwork?: boolean;
};

export const Button = ({
    children,
    onClick,
    className,
    type,
    disabled,
    loading,
    loadingText,
    form,
    checkNetwork,
}: IButtonProps) => {
    const { chain } = useNetwork();
    const { openChainModal } = useChainModal();
    
    const renderType = () => {
        switch (type) {
            case 'wallet':
                return `bg-gradient-to-r from-indigo-600 to-sky-400 !border-0`
            case 'outline':
                return 'bg-gray-900 disabled:border-indigo-900';
            case 'transparent':
                return '!border-0 !bg-transparent hover:text-neutral-300 !p-0';
            default:
                return 'bg-indigo-800 hover:bg-indigo-900 disabled:bg-indigo-900 disabled:text-neutral-400 disabled:border-indigo-900';
        }
    };

    const borderStyle = type === 'wallet' ? `border-0` : `border-indigo-800 hover:border-indigo-900`;
    const paddingStyle = type === 'wallet' ? `p-0.5` : `px-2 py-1 lg:px-4 lg:py-2`
    return (
        <button
            type={form ? form : 'button'}
            onClick={chain?.unsupported && checkNetwork ? openChainModal : onClick}
            disabled={disabled}
            className={`${className} ${renderType()} ${borderStyle} ${paddingStyle} rounded shadow disabled:cursor-not-allowed transition duration-200 border-2 flex items-center gap-2 text-center justify-center whitespace-nowrap disabled:text-neutral-400`}
        >
            {type === 'wallet' ? (
                <div className={`px-2 py-1 lg:px-4 lg:py-2 flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 back rounded-sm transition duration-200 group relative`}>
                    <div className="absolute inset-0 h-0 w-0 transition-all duration-[250ms] ease-out group-hover:h-full group-hover:w-full bg-gradient-to-tr from-gray-800 via-gray-900 to-gray-900"></div>
                    <span className="relative">
                        {loadingText && loading ? loadingText : children}
                    </span>
                </div>
            ) : (
                <>
                    {loadingText && loading ? loadingText : children}
                    {loading && <ImSpinner9 className="animate-spin" />}
                </>
            )}
        </button>
    );
};
