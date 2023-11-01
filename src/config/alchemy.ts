import { Alchemy, Network } from 'alchemy-sdk';

const config = {
    apiKey: process.env.REACT_APP_ALCHEMY_KEY || '',
    network: Network.ETH_MAINNET,
};

/**
 * @deprecated
 * Using llamaNodes now instead for RPC
 */
export const alchemy = new Alchemy(config);
