import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { hardhat, mainnet } from 'wagmi/chains';
import { TESTING } from './common';

export const { chains, provider } = configureChains(
    [TESTING ? hardhat : mainnet],
    [publicProvider()],
);

export const { connectors } = getDefaultWallets({
    appName: 'Pintswap',
    chains,
});

export const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider,
});

export { WagmiConfig, RainbowKitProvider };
