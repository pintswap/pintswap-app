import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect } from 'wagmi';
import { useWindowSize } from '../hooks';
import { Button } from './button';

type IWalletProps = {
    fullWidth?: boolean;
};

export const Wallet = (props: IWalletProps) => {
    const { disconnect } = useDisconnect();
    const { address } = useAccount();
    const { width } = useWindowSize();
    const renderContent = address ? address : width > 600 ? 'Connect Wallet' : 'Connect';

    return (
        <ConnectButton.Custom>
            {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
            }) => {
                // Note: If your app doesn't use authentication, you
                // can remove all 'authenticationStatus' checks
                const ready = mounted && authenticationStatus !== 'loading';
                const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus || authenticationStatus === 'authenticated');

                const determineConnection = () => {
                    if (!connected) {
                        return { onClick: () => openConnectModal(), render: renderContent };
                    } else if (chain.unsupported) {
                        return { onClick: () => openChainModal(), render: 'Wrong Network' };
                    } else {
                        return {
                            onClick: () => disconnect(),
                            render: account.displayName,
                        };
                    }
                };

                return (
                    <div
                        {...(!ready && {
                            'aria-hidden': true,
                            style: {
                                opacity: 0,
                                pointerEvents: 'none',
                                userSelect: 'none',
                            },
                        })}
                    >
                        {(() => {
                            return (
                                <Button
                                    onClick={determineConnection().onClick}
                                    className={`${
                                        props.fullWidth ? 'w-full' : ''
                                    } whitespace-nowrap text-md xl:text-lg`}
                                    type={account ? 'wallet' : 'primary'}
                                >
                                    {determineConnection().render}
                                </Button>
                            );
                        })()}
                    </div>
                );
            }}
        </ConnectButton.Custom>
    );
};
