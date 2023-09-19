import { JSONPeerId } from 'peer-id';
import { IOffer } from '@pintswap/sdk';
import { IUserDataProps } from '../stores';
import { keyBy } from 'lodash';
import { ethers } from 'ethers6';
import { ITokenProps } from './types';

// COMMON
export const APP_VERSION = 'v2.0 BETA';
export const TESTING: boolean = process.env.REACT_APP_DEV ? true : false;
export const BASE_URL: string = window.location.origin;
export const WS_URL: string = `ws://${TESTING ? '127.0.0.1' : BASE_URL}:8545`;

// NETWORKS
export const DEFAULT_NETWORK = 'ethereum';
export const DEFAULT_CHAINID = 1;
export const EXPLORER_URLS: Record<number, string> = {
    1: 'https://etherscan.io',
    42161: 'https://arbiscan.io', // arb
    // 10: 'https://optimistic.etherscan.io', // op
    // 137: 'https://polygonscan.com', // polygon
    // 8453: 'https://basescan.org', // base
};

// ENDPOINTS
export const ENDPOINTS = {
    uniswap: {
        v2: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v2-dev',
        v3: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
    },
    pintswap: 'https://api.thegraph.com/subgraphs/name/pintswap/token-transfers-eth',
};

// TOKENS
const TOKENS: ITokenProps[] = require('./token-list.json').tokens;
export const getTokenList = (chainId = 1) => TOKENS.filter((el) => el.chainId === chainId);
export const getTokenListBySymbol = (chainId = 1) => keyBy(getTokenList(chainId), 'symbol');
export const getTokenListByAddress = (chainId = 1) =>
    keyBy(
        getTokenList(chainId).map((v) => ({ ...v, address: ethers.getAddress(v.address) })),
        'address',
    );

export const ETH = (chainId = 1) => getTokenList(chainId).find((v) => v.symbol === 'ETH');
export const USDC = (chainId = 1) => getTokenList(chainId).find((v) => v.symbol === 'USDC');
export const USDT = (chainId = 1) => getTokenList(chainId).find((v) => v.symbol === 'USDT');
export const DAI = (chainId = 1) => getTokenList(chainId).find((v) => v.symbol === 'DAI');

export const MIN_ABIS = {
    NFT: [
        {
            constant: true,
            inputs: [{ name: '_owner', type: 'address' }],
            name: 'balanceOf',
            outputs: [{ name: 'balance', type: 'uint256' }],
            type: 'function',
        },
        {
            constant: true,
            inputs: [{ name: 'tokenId', type: 'uint256' }],
            name: 'ownerOf',
            outputs: [{ name: '', type: 'address' }],
            type: 'function',
        },
        {
            constant: true,
            inputs: [],
            name: 'totalSupply',
            outputs: [
                {
                    name: '',
                    type: 'uint256',
                },
            ],
            payable: false,
            stateMutability: 'view',
            type: 'function',
        },
    ],
    ERC20: [
        {
            constant: true,
            inputs: [
                {
                    name: '_owner',
                    type: 'address',
                },
            ],
            name: 'balanceOf',
            outputs: [
                {
                    name: 'balance',
                    type: 'uint256',
                },
            ],
            payable: false,
            stateMutability: 'view',
            type: 'function',
        },
        {
            constant: true,
            inputs: [],
            name: 'decimals',
            outputs: [
                {
                    name: '',
                    type: 'uint8',
                },
            ],
            payable: false,
            stateMutability: 'view',
            type: 'function',
        },
        {
            constant: true,
            inputs: [],
            name: 'totalSupply',
            outputs: [
                {
                    name: '',
                    type: 'uint256',
                },
            ],
            payable: false,
            stateMutability: 'view',
            type: 'function',
        },
    ],
};

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

export const DEFAULT_AVATAR = '/img/generic-avatar.jpg';

export const BASE_AVATAR_URL = `data:image/jpg;base64,`;
