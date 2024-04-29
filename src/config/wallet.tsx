import '@rainbow-me/rainbowkit/styles.css';
import {
    connectorsForWallets,
    darkTheme,
    RainbowKitProvider,
    AvatarComponent,
} from '@rainbow-me/rainbowkit';
import { Chain, configureChains, createClient, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { infuraProvider } from 'wagmi/providers/infura';
import { arbitrum, hardhat, mainnet, avalanche } from 'wagmi/chains';
import { ALCHEMY_KEY, INFURA_PROJECT_ID, WALLET_CONNECT_ID, LLAMA_NODES_KEY } from './env';
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

const base: Chain | any = {
    id: 8453,
    name: 'Base',
    network: 'base',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    iconUrl:
        'https://assets-global.website-files.com/5f973c97cf5aea614f93a26c/6451a34baee26f54b2419cf3_base-logo.png',
    iconBackground: '#fff',
    rpcUrls: {
        default: {
            http: ['https://mainnet.base.org'],
        },
        public: {
            http: ['https://mainnet.base.org'],
        },
    },
    blockExplorers: {
        blockscout: {
            name: 'Basescout',
            url: 'https://base.blockscout.com',
        },
        default: {
            name: 'Basescan',
            url: 'https://basescan.org',
        },
        etherscan: {
            name: 'Basescan',
            url: 'https://basescan.org',
        },
    },
};

const degen:Chain | any = {
    id:666666666,
    name:"Degen",
    network:"degen",
    nativeCurrency:{name:"Degen",symbol:"DGN",decimals:18},
    iconUrl:"/networks/degen.svg",
    iconBackground:"#fff",
    rpcUrls:{
        default:{
            http:["https://rpc.degen.tips"]
        },
        public:{
            http:["https://rpc.degen.tips"]
        }
    },
    blockExplorers:{
        default:{
            http:["https://explorer.degen.tips"]
        },
        public:{
            http:["https://explorer.degen.tips"]
        }
    }
} 

const determineChains = () => {
    const chains = [mainnet, arbitrum, avalanche, degen];
    if (process.env.REACT_APP_DEV) chains.push(hardhat as any);
    return chains;
};

export const { chains, provider } = configureChains(determineChains(), [
    // jsonRpcProvider({
    //     rpc: (chain) => ({
    //         http: `https://eth.llamarpc.com/rpc/${LLAMA_NODES_KEY}`,
    //         webSocket: `wss://eth.llamarpc.com/rpc/${LLAMA_NODES_KEY}`,
    //     }),
    // }),
    infuraProvider({
        apiKey: INFURA_PROJECT_ID,
    }),
    alchemyProvider({
        apiKey: ALCHEMY_KEY,
    }),
    publicProvider(),
]);

export const connectors = connectorsForWallets([
    {
        groupName: 'Recommended',
        wallets: [
            metaMaskWallet({ chains, projectId: WALLET_CONNECT_ID }),
            walletConnectWallet({ chains, projectId: WALLET_CONNECT_ID }),
        ],
    },
    {
        groupName: 'Popular',
        wallets: [
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

const CustomAvatar: AvatarComponent = ({ address, ensImage, size }) => {
    return ensImage ? (
        <img src={ensImage} width={size} height={size} style={{ borderRadius: 999 }} />
    ) : (
        <img
            src={'./img/generic-avatar.svg'}
            width={size}
            height={size}
            style={{ borderRadius: 999, backgroundColor: '#fff' }}
        />
    );
};

export { WagmiConfig, RainbowKitProvider, CustomAvatar };
