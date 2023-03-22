import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { hardhat, mainnet, goerli } from 'wagmi/chains';
import { TESTING } from './constants';

export const { chains, provider } = configureChains(
    [TESTING ? hardhat : mainnet, goerli],
    [publicProvider()],
);

export const { connectors } = getDefaultWallets({
    appName: 'ZERO App',
    chains,
});

export const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider,
});

export { WagmiConfig, RainbowKitProvider };
