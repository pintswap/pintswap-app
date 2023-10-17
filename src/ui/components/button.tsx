import { useChainModal, useConnectModal } from '@rainbow-me/rainbowkit';
import { MouseEventHandler, ReactNode } from 'react';
import { ImSpinner9 } from 'react-icons/im';
import { useAccount, useNetwork } from 'wagmi';

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
                return `bg-gradient-to-tr to-accent-light from-primary`;
            case 'outline':
                return 'bg-neutral-900 disabled:border-primary-disabled';
            case 'transparent':
                return '!bg-transparent !text-neutral-100 hover:text-neutral-300 hover:fill-neutral-300 !p-0';
            default:
                return 'bg-primary-regular hover:bg-primary-hover disabled:bg-primary-disabled disabled:text-neutral-400 disabled:border-primary-disabled';
        }
    };

    const renderBorder = () => {
        switch (type) {
            case 'outline':
                return 'border-accent-light hover:border-accent';
            default:
                return 'border-transparent';
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

    const paddingStyle = type === 'wallet' ? `` : `px-2 py-1 lg:px-3 lg:py-1.5`;
    return (
        <button
            type={form ? form : 'button'}
            onClick={render().onClick}
            disabled={disabled}
            className={`${className} ${renderType()} ${renderBorder()} ${paddingStyle} border-2 rounded shadow disabled:cursor-not-allowed transition duration-200 flex items-center gap-2 text-center justify-center whitespace-nowrap disabled:text-neutral-400`}
        >
            {type === 'wallet' ? (
                <div
                    className={`px-2 py-1 lg:px-3 lg:py-1.5 flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 back rounded transition duration-200 group relative`}
                >
                    <div className="absolute h-0 w-0 transition-all duration-150 ease-out group-hover:h-full group-hover:w-full bg-gradient-to-tr from-neutral-900 via-neutral-900 to-neutral-900 rounded"></div>
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