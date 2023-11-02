import '@rainbow-me/rainbowkit/styles.css';
import { connectorsForWallets, darkTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { arbitrum, hardhat, mainnet } from 'wagmi/chains';
import { TESTING } from '../utils/constants';
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

const projectId = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID || '';

const determineChains = () => {
    if (TESTING) return [mainnet, hardhat];
    return [mainnet];
};

export const { chains, provider } = configureChains(determineChains(), [
    jsonRpcProvider({
        rpc: (chain) => ({
            http: `https://eth.llamarpc.com/rpc/${process.env.REACT_APP_LLAMA_NODES_KEY}`,
            webSocket: `wss://eth.llamarpc.com/rpc/${process.env.REACT_APP_LLAMA_NODES_KEY}`,
        }),
    }),
    publicProvider(),
]);

export const connectors = connectorsForWallets([
    {
        groupName: 'Recommended',
        wallets: [metaMaskWallet({ chains, projectId })],
    },
    {
        groupName: 'Popular',
        wallets: [
            walletConnectWallet({ chains, projectId }),
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
