import fetch from "cross-fetch";
import { ethers } from "ethers6";
import { INFTProps } from "./common";

import { providerFromChainId } from "./provider";

const IPFS_GATEWAY = "https://cloudflare-ipfs.com/ipfs/";

export function toGateway(uri: string) {
  if (isGateway(uri)) return IPFS_GATEWAY + uri.substr(7);
  return uri;
}

export function isGateway(uri: string) {
  return uri.substr(0, 7) === 'ipfs://';
}

export const nftCache: any = {};

export const hashNftIdentifier = ({ token, tokenId }: any) => {
  return ethers.solidityPackedKeccak256(['string', 'address', 'uint256'], [ '/pintswap/nft', token, tokenId ]);
}

export async function fetchNFT({ token, tokenId, chainId }: any): Promise<INFTProps> {
  const hash = hashNftIdentifier({ token, tokenId });
  if (nftCache[hash]) return nftCache[hash];
  chainId = chainId || 1;
  const contract = new ethers.Contract(token, ['function tokenURI(uint256) view returns (string)'], providerFromChainId(chainId || 1));
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
  nftCache[hash] = nft;
  console.log('nft', nft)
  return nft;
}
