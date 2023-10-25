import { ethers, Signer, JsonRpcProvider, InfuraProvider } from 'ethers6';
import { DEFAULT_CHAINID } from './constants';

const INFURA_PROJECT_ID = process.env.REACT_APP_INFURA_KEY || '';
const LLAMA_NODES_KEY = process.env.REACT_APP_LLAMA_NODES_KEY || '';

export function providerFromChainId(chainId: number | string) {
    switch (Number(chainId)) {
        case 1:
            return new JsonRpcProvider(`https://eth.llamarpc.com/rpc/${LLAMA_NODES_KEY}`);
        case 137:
            return new InfuraProvider('polygon', INFURA_PROJECT_ID);
        case 42161:
            return new InfuraProvider('arbitrum', INFURA_PROJECT_ID);
        case 43114:
            return new JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
        case 10:
            return new JsonRpcProvider('https://mainnet.optimism.io');
        default:
            return new InfuraProvider('mainnet', INFURA_PROJECT_ID);
    }
}

export async function chainIdFromProvider(provider: Signer) {
    return Number((await provider?.provider?.getNetwork())?.chainId?.toString()) || DEFAULT_CHAINID;
}
