import { useChainModal, useConnectModal } from '@rainbow-me/rainbowkit';
import { MouseEventHandler, ReactNode } from 'react';
import { ImSpinner9 } from 'react-icons/im';
import { useAccount, useNetwork } from 'wagmi';
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
    const { address } = useAccount();
    const { chain } = useNetwork();
    const { openChainModal } = useChainModal();
    const { openConnectModal } = useConnectModal();

    const renderType = () => {
        switch (type) {
            case 'wallet':
                return `bg-gradient-to-tr from-accent-light to-primary !border-0`;
            case 'outline':
                return 'bg-gray-900 disabled:border-primary-disabled';
            case 'transparent':
                return '!border-0 !bg-transparent hover:text-neutral-300 !p-0';
            default:
                return 'bg-primary-regular hover:bg-primary-hover disabled:bg-primary-disabled disabled:text-neutral-400 disabled:border-primary-disabled';
        }
    };

    const render = () => {
        if (loadingText && loading) {
            return {
                text: loadingText,
                onClick: () => {},
            };
        }
        if (!address && checkNetwork) {
            return {
                text: 'Connect Wallet',
                onClick: openConnectModal,
            };
        }
        if (chain?.unsupported && checkNetwork) {
            return {
                text: 'Switch Networks',
                onClick: openChainModal,
            };
        }
        return {
            text: children,
            onClick: onClick,
        };
    };

    const borderStyle =
        type === 'wallet' ? `border-0` : `border-primary-regular hover:border-primary-hover`;
    const paddingStyle = type === 'wallet' ? `p-0.5` : `px-2 py-1 lg:px-3 lg:py-1.5`;
    return (
        <button
            type={form ? form : 'button'}
            onClick={render().onClick}
            disabled={disabled}
            className={`${className} ${renderType()} ${borderStyle} ${paddingStyle} rounded shadow disabled:cursor-not-allowed transition duration-200 border-2 flex items-center gap-2 text-center justify-center whitespace-nowrap disabled:text-neutral-400`}
        >
            {type === 'wallet' ? (
                <div
                    className={`px-2 py-1 lg:px-3 lg:py-1.5 flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 back rounded-sm transition duration-200 group relative`}
                >
                    <div className="absolute inset-0 h-0 w-0 transition-all duration-[250ms] ease-out group-hover:h-full group-hover:w-full bg-gradient-to-tr from-gray-800 via-gray-900 to-gray-900"></div>
                    <span className="relative">{render().text}</span>
                </div>
            ) : (
                <>
                    {render().text}
                    {loading && <ImSpinner9 className="animate-spin" />}
                </>
            )}
        </button>
    );
};
