import { Signer, formatUnits } from 'ethers6';
import {
    convertAmount,
    getDecimals,
    getSymbol,
    getTokenAddress,
    getTokenAttributes,
} from './token';
import { EMPTY_TRADE, TESTING } from './constants';
import { ethers } from 'ethers';
import { ITokenProps } from './types';
import { IOffer } from '@pintswap/sdk';

// Trade
export const buildOffer = async ({ gets, gives }: IOffer, chainId: number = 1): Promise<IOffer> => {
    if (!gets.token && !gives.token) return EMPTY_TRADE;
    const foundGivesToken = (await getTokenAttributes(gives.token, chainId)) as
        | ITokenProps
        | undefined;
    const foundGetsToken = (await getTokenAttributes(gets.token, chainId)) as
        | ITokenProps
        | undefined;

    // NFT
    if (gives?.tokenId) {
        const builtObj = {
            gives: {
                ...gives,
                tokenId: ethers.utils.hexlify(Number(gives.tokenId)),
                amount: undefined,
            },
            gets: {
                token: getTokenAddress(foundGetsToken, gets, chainId),
                amount: await convertAmount('hex', gets?.amount || '0', gets.token, chainId),
            },
        };
        if (TESTING) console.log('#buildTradeObj:', builtObj);
        return builtObj;
    }
    // ERC20
    const builtObj = {
        gives: {
            token: getTokenAddress(foundGivesToken, gives, chainId),
            amount: await convertAmount('hex', gives?.amount || '0', gives.token, chainId),
        },
        gets: {
            token: getTokenAddress(foundGetsToken, gets, chainId),
            amount: await convertAmount('hex', gets?.amount || '0', gets.token, chainId),
        },
    };
    if (TESTING) console.log('#buildTradeObj:', builtObj);
    return builtObj;
};

export const displayOffer = async ({ gets, gives }: IOffer, chainId: number = 1) => {
    try {
        return {
            gives: {
                token: (await getSymbol(gives.token, chainId)) || gives.token,
                amount: await convertAmount('number', gives.amount || '', gives.token, chainId),
            },
            gets: {
                token: (await getSymbol(gets.token, chainId)) || gets.token,
                amount: await convertAmount('number', gets.amount || '', gets.token, chainId),
            },
        };
    } catch (err) {
        console.error(err);
        return {
            gives: {
                token: gives.token,
                amount: gives.amount,
            },
            gets: {
                token: gets.token,
                amount: gets.amount,
            },
        };
    }
};

export const reverseOffer = ({ gets, gives }: IOffer): IOffer => {
    return {
        gives: gets,
        gets: gives,
    };
};

// STRING
export function truncate(s: string, amount?: number) {
    if (!s) return s;
    if (s.match(/\.drip$/) && s.length < 30) return s;
    return `${s.slice(0, amount ? amount : 4)}...${s.slice(amount ? amount * -1 : -4)}`;
}

export const shorten = (s: string) => {
    if (s.match(/\.drip$/) && s.length < 30) return s;
    if (s.length <= 8) return s;
    return `${s.substr(0, 4)}...${s.substr(s.length - 4, 4)}`;
};

export function convertExponentialToDecimal(exponentialNumber: number | string): string {
    // sanity check - is it exponential number
    const str = exponentialNumber.toString();
    if (str.indexOf('e') !== -1) {
        let _exponentialNumber: number;
        if (typeof exponentialNumber === 'string') _exponentialNumber = Number(exponentialNumber);
        else _exponentialNumber = exponentialNumber;
        const exponent = parseInt(str.split('-')[1], 10);
        // Unfortunately I can not return 1e-8 as 0.00000001, because even if I call parseFloat() on it,
        // it will still return the exponential representation
        // So I have to use .toFixed()
        const result = _exponentialNumber.toFixed(exponent);
        return result;
    } else {
        return String(exponentialNumber);
    }
}

export function parseTickerAsset(ticker: string, asset: 1 | 2, icon?: boolean) {
    if (!ticker) return '';
    else {
        if (!ticker.includes('/')) return ticker;
        const split = ticker.split('/');
        if (asset === 1) return split[0];
        else return split[1];
    }
}

export const maybeShorten = (s: string): string => {
    if (s.substr(0, 2) === '0x') return shorten(s);
    return s;
};

export const maybeFormatMultiAddr = (s: string): string => {
    if (!s) return '';
    if ((s.startsWith('Q') && s.length > 30) || (s.startsWith('pint') && s.length > 30))
        return shorten(s);
    return s;
};

// Subgraph Pintswap Trades
export async function formatPintswapTrade(trade: any) {
    const tradeChainId = Number(trade.chainId || '1');
    const givesDecimals = await getDecimals(trade.gives.token, tradeChainId);
    const givesAmount = formatUnits(trade.gives.amount, givesDecimals);
    const givesSymbol = await getSymbol(trade.gives.token, tradeChainId);

    const getsDecimals = await getDecimals(trade.gets.token, tradeChainId);
    const getsAmount = formatUnits(trade.gets.amount, getsDecimals);
    const getsSymbol = await getSymbol(trade.gets.token, tradeChainId);

    return {
        hash: trade.id,
        timestamp: new Date(Number(trade.timestamp) * 1000).toLocaleDateString(),
        chainId: Number(trade.chainId),
        pair: trade.pair,
        maker: trade.maker,
        taker: trade.taker,
        gets: {
            amount: getsAmount,
            address: trade.gets.token,
            symbol: getsSymbol,
            decimals: getsDecimals,
        },
        gives: {
            amount: givesAmount,
            address: trade.gives.token,
            symbol: givesSymbol,
            decimals: givesDecimals,
        },
        sending: `${givesAmount} ${givesSymbol}`,
        receiving: `${getsAmount} ${getsSymbol}`,
    };
}

// CSS CLASS
export function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

export const dropdownItemClass = (active: boolean) =>
    classNames(
        active ? 'bg-neutral-900 text-neutral-200' : 'text-neutral-300',
        'flex items-center gap-2 px-4 py-2 text-sm transition duration-100 w-full',
    );

export const numberFormatter = (decimals = 3) =>
    new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: decimals,
    });

export const percentFormatter = (decimals = 2) =>
    new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        notation: 'compact',
    });
