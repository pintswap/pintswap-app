import { createFromB58String, JSONPeerId } from 'peer-id';
import { IOffer } from '@pintswap/sdk';
import { ethers } from 'ethers6';
import { ITokenProps, TOKENS } from './token-list';
import { IPintswapProps, IUserDataProps } from '../stores';
import { constants } from 'ethers';

// TYPES
export type INFTProps = {
  attributes: any[];
  background_color: string;
  external_url: string;
  image: string;
  name: string;
  description: string;
  amount?: string;
  token: string;
  tokenId: string | number;
  imageBlob: Blob | MediaSource;
  hash: string;
}

// CONSTANTS
export const NETWORK: string = process.env.REACT_APP_NETWORK || 'ETHEREUM';
export const TESTING: boolean = process.env.REACT_APP_DEV ? true : false;
export const BASE_URL: string = window.location.origin;
export const WS_URL: string = `ws://${TESTING ? '127.0.0.1' : BASE_URL}:8545`;

// DEFAULT VALS
export const EMPTY_TRADE: IOffer = {
    gets: { token: '', amount: '' },
    gives: { amount: '', token: '' }
};

export const EMPTY_PEER: JSONPeerId = {
    id: '', privKey: '', pubKey: '',
};

export const EMPTY_USER_DATA: IUserDataProps = {
  img: '', bio: '', name: '', offers: [], privateKey: ''
}

// CSS HELPERS
export function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
  }
  
// TOKEN HELPERS
export const alphaTokenSort = (a: ITokenProps, b: ITokenProps) => {
  const textA = a.symbol.toUpperCase();
  const textB = b.symbol.toUpperCase();
  return textA < textB ? -1 : textA > textB ? 1 : 0;
};

export const getDecimals = (token: string) => {
  let found;
  if (token.startsWith('0x')) {
      found = TOKENS.find((el) => el.address.toLowerCase() === token.toLowerCase())?.decimals;
  } else {
      found = TOKENS.find((el) => el.symbol.toLowerCase() === token.toLowerCase())?.decimals;
  }
  return found || 18;
};

export function getTokenAttributes(token: string, attribute?: keyof ITokenProps) {
  let found;
  if (!token) return token;
  if (token.includes('0x')) {
      found = TOKENS.find((el) => el.address.toLowerCase() === token.toLowerCase());
  } else {
      found = TOKENS.find((el) => el.symbol.toLowerCase() === token.toLowerCase());
  }
  if (found) {
      if (attribute) return found[attribute];
      else return found;
  } else {
      console.warn('#getTokenAttributes: Error finding token', {
          token,
          found,
      });
      return '';
  }
}

export function convertAmount(to: 'hex' | 'number' | 'readable', amount: string, token: string) {
  let output;
  if (to === 'hex') {
      if (amount.startsWith('0x')) output = amount;
      else output = ethers.toBeHex(ethers.parseUnits(amount, getDecimals(token)));
  } else {
      if (amount.startsWith('0x')) output = ethers.formatUnits(amount, getDecimals(token));
      else output = amount;
  }
  if (TESTING) console.log('#convertAmount:', { amount, token, output });
  return to === 'readable'
      ? `${output}  ${getTokenAttributes(token, 'symbol') || 'N/A'}`
      : output;
}

// STRING HELPERS
export function truncate(s: string, amount?: number) {
  if (!s) return s;
  if (s.match(/\.drip$/)) return s;
  return `${s.slice(0, amount ? amount : 4)}...${s.slice(amount ? amount * -1 : -4)}`;
}

export const shorten = (s: string) => {
  if (s.match(/\.drip$/)) return s;
  if (s.length <= 8) return s;
  return `${s.substr(0, 4)}...${s.substr(s.length - 4, 4)}`;
};

// NUMBER HELPERS
export function round(value: string | number, decimals: number, returnType?: 'number' | 'string') {
  if (value === '0.00') return '0.00';
  const _value = typeof value === 'string' ? parseFloat(value) : value;
  const factorOfTen = Math.pow(10, decimals);
  if(returnType === 'string') return (Math.round(_value * factorOfTen) / factorOfTen).toString()
  return Math.round(_value * factorOfTen) / factorOfTen;
}

// PEER HELPERS
export function defer() {
  let resolve,
      reject,
      promise = new Promise((_resolve, _reject) => {
          resolve = _resolve;
          reject = _reject;
      });
  return {
      resolve,
      reject,
      promise,
  };
}

export async function getPeerData(ps: IPintswapProps, peer: string) {
  const { module } = ps;
  let formattedPeerAddress;
  if(peer.includes('.drip')) {
    formattedPeerAddress = await module?.resolveName(peer) || constants.AddressZero;
  } else {
    formattedPeerAddress = peer;
  }
  const b58peer = createFromB58String(formattedPeerAddress).toB58String();
  const res = await module?.getUserDataByPeerId(b58peer);
  if(res) return res;
  else return { offers: [], bio: '', image: '' };
}

export const formattedPeerName = async (ps: IPintswapProps, peer: string) => {
  const { module } = ps;
  if(peer.includes('.drip')) return peer;
  else {
    const shortAddress = await module?.resolveName(peer);
    if(shortAddress) return shortAddress;
  }
  return peer;
};
