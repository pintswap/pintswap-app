import { JSONPeerId } from 'peer-id';
import { IOffer } from '@pintswap/sdk';
import { IUserDataProps } from '../stores';
import { keyBy } from 'lodash';
import { ethers } from 'ethers6';
import { ITokenProps } from './types';

// COMMON
export const APP_VERSION = 'v2.4 BETA';
export const TESTING: boolean = process.env.REACT_APP_DEV ? true : false;
export const BASE_URL: string = window.location.origin;
export const WS_URL: string = `ws://${TESTING ? '127.0.0.1' : BASE_URL}:8545`;

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

// CONTRACTS
export const CONTRACTS = {
    mainnet: {
        WOCK: '0xcB72ed407Cdb97a7161a2b567b5f50B55585Ee6b',
        WOCKRedeem: '0x8a20b541aacc05f824f67532de995e3687431499',
        TRIS: '0x0055485fCa054D165fc0C7D836459722436544c1',
        TRISRedeem: '0xfef8205d4c472fe0442fc1026acc34e6d88e438c',
        PINT: '0x58fB30A61C218A3607e9273D52995a49fF2697Ee',
        OPPS: '0xd665F1153599e8F799b2514069dF4481d3bcb043',
        sipPINT: '0x1e8352e5d5e9ef7a68432a39118082653e8a9758',
    },
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
        {
            constant: true,
            inputs: [{ name: '', type: 'uint256' }],
            name: 'tokenURI',
            outputs: [{ name: '', type: 'string' }],
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
    address: '',
    offers: [],
    privateKey: '',
    active: false,
    extension: '.drip',
    loading: false,
};

export const DEFAULT_AVATAR = '/img/generic-avatar.jpg';

export const BASE_AVATAR_URL = `data:image/jpg;base64,`;
