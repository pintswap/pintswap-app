import { JSONPeerId } from 'peer-id';
import { IOffer } from '@pintswap/sdk';
import { IUserDataProps } from '../stores';
import { keyBy } from 'lodash';
import { ethers } from 'ethers6';
import { TOKENS } from './token-list';

// COMMON
export const NETWORK: string = process.env.REACT_APP_NETWORK || 'ETHEREUM';
export const TESTING: boolean = process.env.REACT_APP_DEV ? true : false;
export const BASE_URL: string = window.location.origin;
export const WS_URL: string = `ws://${TESTING ? '127.0.0.1' : BASE_URL}:8545`;

// TOKENS
export const TOKENS_BY_SYMBOL = keyBy(TOKENS, 'symbol');
export const TOKENS_BY_ADDRESS = keyBy(
    TOKENS.map((v) => ({ ...v, address: ethers.getAddress(v.address) })),
    'address',
);
export const ETH: any = TOKENS.find((v) => v.symbol === 'ETH');
export const USDC: any = TOKENS.find((v) => v.symbol === 'USDC');
export const USDT: any = TOKENS.find((v) => v.symbol === 'USDT');
export const DAI: any = TOKENS.find((v) => v.symbol === 'DAI');

// DEFAULT VALS
export const EMPTY_TRADE: IOffer = {
    gets: { token: '', amount: '' },
    gives: { amount: '', token: '' },
};

export const EMPTY_PEER: JSONPeerId = {
    id: '',
    privKey: '',
    pubKey: '',
};

export const EMPTY_USER_DATA: IUserDataProps = {
    img: '',
    bio: '',
    name: '',
    offers: [],
    privateKey: '',
    active: false,
    extension: '.drip',
    loading: false,
};

export const DEFAULT_AVATAR = '/black.jpg';

export const BASE_AVATAR_URL = `data:image/jpg;base64,`;
