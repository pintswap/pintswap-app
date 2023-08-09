import '@rainbow-me/rainbowkit/styles.css';
import { connectorsForWallets, darkTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { hardhat, mainnet } from 'wagmi/chains';
import { NETWORK } from './constants';
import {
    coinbaseWallet,
    injectedWallet,
    metaMaskWallet,
    rainbowWallet,
    trustWallet,
    walletConnectWallet,
    imTokenWallet,
    ledgerWallet,
    braveWallet,
} from '@rainbow-me/rainbowkit/wallets';
import merge from 'lodash.merge';

const projectId = '78ccad0d08b9ec965f59df86cc3e6a3c';

import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect';

const connector = new WalletConnectConnector({
    options: {
        projectId,
    },
});

export const { chains, provider } = configureChains(
    [NETWORK === 'LOCALHOST' ? hardhat : mainnet],
    [publicProvider()],
);

export const connectors = connectorsForWallets([
    {
        groupName: 'Recommended',
        wallets: [metaMaskWallet({ chains, projectId })],
    },
    {
        groupName: 'Popular',
        wallets: [
            coinbaseWallet({ appName: 'PintSwap', chains }),
            rainbowWallet({ chains, projectId }),
            trustWallet({ chains, projectId }),
            ledgerWallet({ chains, projectId }),
            imTokenWallet({ chains, projectId }),
            braveWallet({ chains }),
            injectedWallet({ chains }),
        ],
    },
]);

export const walletTheme = merge(
    darkTheme({
        borderRadius: 'small',
        accentColor: '#4f46e5',
    }),
);

export const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider,
});

export { WagmiConfig, RainbowKitProvider };
