import { JSONPeerId } from 'peer-id';
import { IOffer } from '@pintswap/sdk';
import { IUserDataProps } from '../stores';
import { keyBy } from 'lodash';
import { ethers } from 'ethers6';
import { ITokenProps } from './types';
import { getChainId } from './provider';

// COMMON
export const APP_VERSION = 'v4.0 BETA';
export const TESTING: boolean = process.env.REACT_APP_DEV ? true : false;
export const BASE_URL: string = window.location.origin;
export const WS_URL: string = `ws://${TESTING ? '127.0.0.1' : BASE_URL}:8545`;
export const DEFAULT_INTERVAL = 6000;
export const DEFAULT_TIMEOUT = 4000;

// NETWORKS
export const DEFAULT_NETWORK = 'ethereum';
export const DEFAULT_CHAINID = 1;
export const NETWORKS: Record<number, Record<'explorer' | 'logo' | 'name', string>> = {
    1: {
        explorer: 'https://etherscan.io',
        logo: '/networks/ethereum.svg',
        name: 'Ethereum',
    },
    42161: {
        explorer: 'https://arbiscan.io',
        logo: '/networks/arbitrum.svg',
        name: 'Arbitrum',
    },
};

// ENDPOINTS
export const ENDPOINTS: Record<'uniswap' | 'pintswap', Record<string, string>> = {
    uniswap: {
        v2: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v2-dev',
        v3: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
    },
    pintswap: {
        eth: 'https://api.thegraph.com/subgraphs/name/pintswap/token-transfers-eth',
        arb: 'https://api.thegraph.com/subgraphs/name/pintswap/token-transfers-arb',
    },
};

// TOKENS
const TOKENS: ITokenProps[] = require('./token-list.json').tokens;
export const getTokenList = (chainId?: number) =>
    TOKENS.filter((el) => (el.chainId === chainId ? chainId : getChainId()));
export const getTokenListBySymbol = (chainId?: number) => keyBy(getTokenList(chainId), 'symbol');
export const getTokenListByAddress = (chainId?: number) =>
    keyBy(
        getTokenList(chainId).map((v) => ({ ...v, address: ethers.getAddress(v.address) })),
        'address',
    );

export const ETH = (chainId?: number) => getTokenList(chainId).find((v) => v.symbol === 'ETH');
export const USDC = (chainId?: number) => getTokenList(chainId).find((v) => v.symbol === 'USDC');
export const USDT = (chainId?: number) => getTokenList(chainId).find((v) => v.symbol === 'USDT');
export const DAI = (chainId?: number) => getTokenList(chainId).find((v) => v.symbol === 'DAI');

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
    address: '',
    offers: [],
    privateKey: '',
    active: false,
    extension: '.drip',
    loading: false,
};

export const DEFAULT_AVATAR = '/img/generic-avatar.jpg';

export const BASE_AVATAR_URL = `data:image/jpg;base64,`;

// ENV
export const WALLET_CONNECT_ID =
    process.env.REACT_APP_WALLETCONNECT_PROJECT_ID || '78ccad0d08b9ec965f59df86cc3e6a3c';
export const LLAMA_NODES_KEY =
    process.env.PROCESS_APP_LLAMA_NODES_KEY || '01HDHGP0YXWDYKRT37QQBDGST5';
export const ALCHEMY_KEY = process.env.REACT_APP_ALCHEMY_KEY || 'vwnSKKEvi4HqnhPObIph_5GENWoaMb8a';
export const INFURA_PROJECT_ID = process.env.REACT_APP_INFURA_KEY || '';
