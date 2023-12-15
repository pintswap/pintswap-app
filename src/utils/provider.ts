import { ethers, Signer } from 'ethers6';
import { DEFAULT_CHAINID } from './constants';
import { getNetwork } from '@wagmi/core';
import { providerFromChainId } from '@pintswap/sdk';

async function chainIdFromProvider(provider: Signer) {
    return Number((await provider?.provider?.getNetwork())?.chainId?.toString()) || DEFAULT_CHAINID;
}

function getChainId() {
    return getNetwork().chain?.unsupported
        ? DEFAULT_CHAINID
        : getNetwork().chain?.id || DEFAULT_CHAINID;
}

export { chainIdFromProvider, getChainId, providerFromChainId };
