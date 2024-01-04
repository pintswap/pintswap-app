import fetch from 'cross-fetch';
import { ethers, getAddress, isAddress } from 'ethers6';
import { getChainId, providerFromChainId } from './provider';
import { INFTProps } from './types';
import { DEFAULT_CHAINID, TESTING } from './constants';
import { MIN_ABIS } from './contracts';

const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

export const nftCache: any = {};

export function toGateway(uri: string) {
    if (isGateway(uri)) return IPFS_GATEWAY + uri.substr(7);
    return uri;
}

export function isGateway(uri: string) {
    return uri.substr(0, 7) === 'ipfs://';
}

export const hashNftIdentifier = ({ token, tokenId }: any) => {
    return ethers.solidityPackedKeccak256(
        ['string', 'address', 'uint256'],
        ['/pintswap/nft', token, tokenId],
    );
};

export async function fetchNFT(
    { token, tokenId, chainId, owner }: any,
    txHash?: string,
): Promise<INFTProps> {
    const hash = hashNftIdentifier({ token, tokenId });
    if (nftCache[hash]) return nftCache[hash];
    chainId = chainId || getChainId();
    const contract = new ethers.Contract(token, MIN_ABIS.NFT, providerFromChainId(chainId) as any);
    const uri = await contract.tokenURI(tokenId);
    let nft;
    try {
        nft = JSON.parse(uri);
    } catch (e) {
        nft = await (await fetch(toGateway(uri), { method: 'GET' })).json();
    }
    nft.imageBlob = await (await fetch(toGateway(nft.image), { method: 'GET' })).blob();
    nft.tokenId = tokenId;
    nft.token = token;
    if (owner && isAddress(owner)) {
        const balance = (await contract.balanceOf(getAddress(owner))).toString();
        nft.amount = balance;
    }
    if (txHash) nft.hash = txHash;
    nftCache[hash] = nft;
    if (TESTING) console.log('#fetchNFT:', nft);
    return nft;
}
