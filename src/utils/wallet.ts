import '@rainbow-me/rainbowkit/styles.css';
import { connectorsForWallets, darkTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { hardhat, mainnet, polygon, arbitrum, optimism, zkSync } from 'wagmi/chains';
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

const determineNetworks = () => {
    if (NETWORK === 'LOCALHOST') return [hardhat, mainnet];
    return [mainnet, polygon, arbitrum, optimism, zkSync];
};

export const { chains, provider } = configureChains(determineNetworks(), [publicProvider()]);

export const connectors = connectorsForWallets([
    {
        groupName: 'Recommended',
        wallets: [metaMaskWallet({ chains })],
    },
    {
        groupName: 'Popular',
        wallets: [
            coinbaseWallet({ appName: 'PintSwap', chains }),
            rainbowWallet({ chains }),
            walletConnectWallet({ chains }),
            trustWallet({ chains }),
            ledgerWallet({ chains }),
            imTokenWallet({ chains }),
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
