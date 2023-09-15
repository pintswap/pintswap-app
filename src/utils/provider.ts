import { ethers, Signer } from 'ethers6';
import { DEFAULT_CHAINID } from './constants';

// TODO: move this to .env
const INFURA_PROJECT_ID = process.env.REACT_APP_INFURA_KEY || '';

export function providerFromChainId(chainId: number | string) {
    switch (Number(chainId)) {
        case 1:
            return new ethers.InfuraProvider('mainnet', INFURA_PROJECT_ID);
        case 137:
            return new ethers.InfuraProvider('polygon', INFURA_PROJECT_ID);
        case 42161:
            return new ethers.InfuraProvider('arbitrum', INFURA_PROJECT_ID);
        case 43114:
            return new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
        case 10:
            return new ethers.JsonRpcProvider('https://mainnet.optimism.io');
        default:
            return new ethers.InfuraProvider('mainnet', INFURA_PROJECT_ID);
    }
}

export async function chainIdFromProvider(provider: Signer) {
    return Number((await provider?.provider?.getNetwork())?.chainId?.toString()) || DEFAULT_CHAINID;
}
