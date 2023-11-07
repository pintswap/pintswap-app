import '@rainbow-me/rainbowkit/styles.css';
import { connectorsForWallets, darkTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { alchemyProvider } from 'wagmi/providers/alchemy';
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

const projectId =
    process.env.REACT_APP_WALLETCONNECT_PROJECT_ID || '78ccad0d08b9ec965f59df86cc3e6a3c';
const REACT_APP_LLAMA_NODES_KEY =
    process.env.PROCESS_APP_LLAMA_NODES_KEY || '01HDHGP0YXWDYKRT37QQBDGST5';
const REACT_APP_ALCHEMY_KEY =
    process.env.REACT_APP_ALCHEMY_KEY || 'vwnSKKEvi4HqnhPObIph_5GENWoaMb8a';

const determineChains = () => {
    if (TESTING) return [mainnet, hardhat];
    return [mainnet];
};

export const { chains, provider } = configureChains(determineChains(), [
    jsonRpcProvider({
        rpc: (chain) => ({
            http: `https://eth.llamarpc.com/rpc/${REACT_APP_LLAMA_NODES_KEY}`,
            webSocket: `wss://eth.llamarpc.com/rpc/${REACT_APP_LLAMA_NODES_KEY}`,
        }),
    }),
    alchemyProvider({
        apiKey: REACT_APP_ALCHEMY_KEY || '',
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
