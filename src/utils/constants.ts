import { JSONPeerId } from 'peer-id';
import { IOffer } from '@pintswap/sdk';
import { IUserDataProps } from '../stores';
import { keyBy } from 'lodash';
import { ethers } from 'ethers6';
import { ITokenProps } from './types';
import { getChainId } from './provider';
import { SUBGRAPH_API_KEY } from '../config';

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
    43114: {
        explorer: 'https://subnets.avax.network/c-chain',
        logo: '/networks/avalanche.svg',
        name: 'Avalanche',
    },
    666666666: {
        explorer: 'https://explorer.degen.tips/',
        logo: '/networks/degen.svg',
        name: 'Degen',
    },
};

// ENDPOINTS
export const ENDPOINTS: Record<'uniswap' | 'pintswap', Record<string, string>> = {
    uniswap: {
        v2: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v2-dev',
        v2Fallback: `https://gateway-arbitrum.network.thegraph.com/api/${SUBGRAPH_API_KEY}/subgraphs/id/J2oP9UNBjsnuDDW1fAoHKskyrNLFNBB2badQU6UvEtJp`,
        v3: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
        arb: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-arbitrum-one',
        avax: `https://gateway-arbitrum.network.thegraph.com/api/${SUBGRAPH_API_KEY}/subgraphs/id/4KgG6aek9cEp8MXQZKWCmeJWj5Y77mK9tPRAD1kDQa8Q`,
        degen: `https://api.coingecko.com/api/v3/simple/price?ids=degen-base&vs_currencies=usd`,
    },
    pintswap: {
        eth: 'https://api.thegraph.com/subgraphs/name/pintswap/token-transfers-eth',
        arb: 'https://api.thegraph.com/subgraphs/name/pintswap/token-transfers-arb',
        avax: 'https://api.thegraph.com/subgraphs/name/pintswap/token-transfers-avax',
        opt: 'https://api.thegraph.com/subgraphs/name/pintswap/token-transfers-opt',
    },
};

// TOKENS
const TOKENS: ITokenProps[] = require('./token-list.json').tokens;
export const getTokenList = (chainId?: number) =>
    TOKENS.filter((el) => el.chainId === (chainId ? chainId : getChainId()));
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
