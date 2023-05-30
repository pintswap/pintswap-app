import { ethers } from 'ethers6';

const INFURA_PROJECT_ID = '2f1de898efb74331bf933d3ac469b98d';

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
