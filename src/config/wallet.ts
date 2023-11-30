import '@rainbow-me/rainbowkit/styles.css';
import { connectorsForWallets, darkTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { arbitrum, hardhat, mainnet } from 'wagmi/chains';
import { ALCHEMY_KEY, LLAMA_NODES_KEY, TESTING, WALLET_CONNECT_ID } from '../utils/constants';
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

const determineChains = () => {
    if (TESTING) return [mainnet, arbitrum, hardhat];
    return [mainnet, arbitrum];
};

export const { chains, provider } = configureChains(determineChains(), [
    // jsonRpcProvider({
    //     rpc: (chain) => ({
    //         http: `https://eth.llamarpc.com/rpc/${LLAMA_NODES_KEY}`,
    //         webSocket: `wss://eth.llamarpc.com/rpc/${LLAMA_NODES_KEY}`,
    //     }),
    // }),
    alchemyProvider({
        apiKey: ALCHEMY_KEY || '',
    }),
    publicProvider(),
]);

export const connectors = connectorsForWallets([
    {
        groupName: 'Recommended',
        wallets: [metaMaskWallet({ chains, projectId: WALLET_CONNECT_ID })],
    },
    {
        groupName: 'Popular',
        wallets: [
            walletConnectWallet({ chains, projectId: WALLET_CONNECT_ID }),
            coinbaseWallet({ appName: 'PintSwap', chains }),
            rainbowWallet({ chains, projectId: WALLET_CONNECT_ID }),
            trustWallet({ chains, projectId: WALLET_CONNECT_ID }),
            ledgerWallet({ chains, projectId: WALLET_CONNECT_ID }),
            imTokenWallet({ chains, projectId: WALLET_CONNECT_ID }),
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
