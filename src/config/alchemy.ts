import { Alchemy, Network } from 'alchemy-sdk';

const config = {
    apiKey: process.env.REACT_APP_ALCHEMY_KEY || '',
    network: Network.ETH_MAINNET,
};

/**
 * @deprecated
 * Using llamaNodes now instead for RPC
 */
export const alchemy: Record<number, any> = {
    1: new Alchemy(config),
    42161: new Alchemy({ ...config, network: Network.ARB_MAINNET }),
};
