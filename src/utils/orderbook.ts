import { TOKENS } from './token-list';
import { ethers } from 'ethers6';
import { keyBy } from 'lodash';
import { sortBy, groupBy } from 'lodash';
import { round, shorten } from './common';
import { hashOffer } from '@pintswap/sdk';
import { isERC20Transfer } from "@pintswap/sdk/lib/trade";

const ETH: any = TOKENS.find((v) => v.symbol === 'ETH');
const USDC: any = TOKENS.find((v) => v.symbol === 'USDC');
const USDT: any = TOKENS.find((v) => v.symbol === 'USDT');
const DAI: any = TOKENS.find((v) => v.symbol === 'DAI');

export const decimalsCache: any = {};
export const symbolCache: any = {};

export const TOKENS_BY_SYMBOL = keyBy(TOKENS, 'symbol');
export const TOKENS_BY_ADDRESS = keyBy(TOKENS.map((v) => ({ ...v, address: ethers.getAddress(v.address) })), 'address');

const maybeShorten = (s: string): string => {
    if (s.substr(0, 2) === '0x') return shorten(s);
    return s;
};

export function toAddress(symbolOrAddress: string): string {
    const token = TOKENS_BY_SYMBOL[symbolOrAddress];
    if (token) return ethers.getAddress(token.address);
    return ethers.getAddress(symbolOrAddress);
}

export function fromAddress(symbolOrAddress: string): string {
  return (TOKENS_BY_ADDRESS[symbolOrAddress] || { address: symbolOrAddress }).address;
}

export async function toTicker(pair: any, provider: any) {
    const flipped = [...pair].reverse();
    return (
        await Promise.all(
            flipped.map(async (v: any) => maybeShorten(await getSymbol(v.address, provider))),
        )
    ).join('/');
}

export async function getSymbol(address: any, provider: any) {
    address = ethers.getAddress(address);
    const match = TOKENS.find((v) => ethers.getAddress(v.address) === address);
    if (match) return match.symbol;
    else if (symbolCache[address]) {
        return symbolCache[address];
    } else {
        const contract = new ethers.Contract(
            address,
            ['function symbol() view returns (string)'],
            provider,
        );
        try {
            symbolCache[address] = await contract.symbol();
        } catch (e) {
            symbolCache[address] = address;
        }
        return symbolCache[address];
    }
}

function givesBase(offer: any) {
    return {
        pair: [
            {
                amount: offer.gives.amount,
                address: offer.gives.token,
            },
            {
                amount: offer.gets.amount,
                address: offer.gets.token,
            },
        ],
        type: 'bid',
    };
}
function givesTrade(offer: any) {
    return { pair: givesBase(offer).pair.reverse(), type: 'ask' };
}

export const sortBids = (orders: any) => {
    return (orders || []).slice().sort((a: any, b: any) => {
        return Number(b.price) - Number(a.price);
    });
};

export const sortAsks = (orders: any) => {
    return (orders || []).slice().sort((a: any, b: any) => {
        return Number(b.price) - Number(a.price);
    });
};

export const sortLimitOrders = (limitOrders: any) => {
    return Object.values(groupBy(limitOrders, 'ticker'))
        .map((v: any) => {
            const { bid, ask } = groupBy(v, 'type');
            return sortAsks(ask).concat(sortBids(bid));
        })
        .reduce((r, v) => r.concat(v), []);
};

export async function getDecimals(address: any, provider: any) {
    address = ethers.getAddress(address);
    const match = TOKENS.find((v) => ethers.getAddress(v.address) === address);
    if (match) return match.decimals;
    else if (decimalsCache[address]) {
        return decimalsCache[address];
    } else {
        const contract = new ethers.Contract(
            address,
            ['function decimals() view returns (uint8)'],
            provider,
        );
        decimalsCache[address] = Number(await contract.decimals());
        return decimalsCache[address];
    }
}

export function orderTokens(offer: any) {
    const mapped = {
        gives: {
            amount: offer.gives.amount,
            token: toAddress(offer.gives.token),
        },
        gets: {
            token: toAddress(offer.gets.token),
            amount: offer.gets.amount,
        },
    };
    console.log(mapped);
    if (mapped.gives.token === USDC.address) {
        return givesBase(mapped);
    } else if (mapped.gets.token === USDC.address) {
        return givesTrade(mapped);
    } else if (mapped.gives.token === USDT.address) {
        return givesBase(mapped);
    } else if (mapped.gets.token === USDT.address) {
        return givesTrade(mapped);
    } else if (mapped.gives.token === DAI.address) {
        return givesBase(mapped);
    } else if (mapped.gets.token === DAI.address) {
        return givesTrade(mapped);
    } else if (mapped.gives.token === ETH.address) {
        return givesBase(mapped);
    } else if (mapped.gets.token === ETH.address) {
        return givesTrade(mapped);
    } else if (Number(mapped.gives.token.toLowerCase()) < Number(mapped.gets.token.toLowerCase())) {
        return givesBase(mapped);
    } else return givesTrade(mapped);
}

export async function fromFormatted(trade: any, provider: any) {
    const [givesToken, getsToken] = [trade.gives, trade.gets].map((v) => toAddress(v.token));
    return {
        gives: {
            token: givesToken,
            amount: ethers.toBeHex(
                ethers.parseUnits(trade.gives.amount, await getDecimals(givesToken, provider)),
            ),
        },
        gets: {
            amount: ethers.toBeHex(
                ethers.parseUnits(trade.gets.amount, await getDecimals(getsToken, provider)),
            ),
            token: getsToken,
        },
    };
}

export async function toFormatted(transfer: any, provider: any) {
  if (!isERC20Transfer(transfer)) return transfer;
  const token = fromAddress(transfer.token);
  const decimals = await getDecimals(transfer.token, provider);
  const amount = Number(ethers.formatUnits(transfer.amount, decimals)).toFixed(4);
  return {
    token,
    amount
  };
}
    
  

export async function toLimitOrder(offer: any, provider: any) {
    const {
        pair: [base, trade],
        type,
    } = orderTokens(offer);
    const [baseDecimals, tradeDecimals] = await Promise.all(
        [base, trade].map(async (v) => await getDecimals(v.address, provider)),
    );
    const price =
        Number(ethers.formatUnits(base.amount, baseDecimals)) /
        Number(ethers.formatUnits(trade.amount, tradeDecimals));
    return {
        price: round(price, 4, 'string'),
        amount: ethers.formatUnits(trade.amount, tradeDecimals),
        type,
        ticker: await toTicker([base, trade], provider),
        hash: hashOffer(offer),
    };
}
