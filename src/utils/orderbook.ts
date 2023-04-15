import { TOKENS } from './token-list';
import { ethers } from 'ethers';
import { shorten } from './shorten';

const ETH: any = TOKENS.find((v) => v.symbol === 'ETH');
const USDC: any = TOKENS.find((v) => v.symbol === 'USDC');
const USDT: any = TOKENS.find((v) => v.symbol === 'USDT');
const DAI: any = TOKENS.find((v) => v.symbol === 'DAI');

export const decimalsCache: any = {};
export const symbolCache: any = {};

const maybeShorten = (s: string): string => {
    if (s.substr(0, 2) === '0x') return shorten(s);
    return s;
};

export async function toTicker(pair: any, provider: any) {
    return (
        await Promise.all(
            pair.map(async (v: any) => maybeShorten(await getSymbol(v.address, provider))),
        )
    ).join('/');
}

export async function getSymbol(address: any, provider: any) {
    address = ethers.utils.getAddress(address);
    const match = TOKENS.find((v) => ethers.utils.getAddress(v.address) === address);
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
                amount: offer.givesAmount,
                address: offer.givesToken,
            },
            {
                amount: offer.getsAmount,
                address: offer.getsToken,
            },
        ],
        type: 'ask',
    };
}
function givesTrade(offer: any) {
    return { pair: givesBase(offer).pair.reverse(), type: 'bid' };
}

export async function getDecimals(address: any, provider: any) {
    address = ethers.utils.getAddress(address);
    const match = TOKENS.find((v) => ethers.utils.getAddress(v.address) === address);
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
    if (offer.givesToken === USDC.address) {
        return givesBase(offer);
    } else if (offer.getsToken === USDC.address) {
        return givesTrade(offer);
    } else if (offer.givesToken === USDT.address) {
        return givesBase(offer);
    } else if (offer.getsToken === USDT.address) {
        return givesTrade(offer);
    } else if (offer.givesToken === DAI.address) {
        return givesBase(offer);
    } else if (offer.getsToken === DAI.address) {
        return givesTrade(offer);
    } else if (offer.givesToken === ETH.address) {
        return givesBase(offer);
    } else if (offer.getsToken === ETH.address) {
        return givesTrade(offer);
    } else if (Number(offer.givesToken.toLowerCase()) < Number(offer.getsToken.toLowerCase())) {
        return givesBase(offer);
    } else return givesTrade(offer);
}

export async function toLimitOrder(offer: any, provider: any) {
    const {
        pair: [base, trade],
        type,
    } = orderTokens(offer);
    const [baseDecimals, tradeDecimals] = await Promise.all(
        [base, trade].map(async (v) => await getDecimals(v.address, provider)),
    );
    return {
        price:
            (Number(ethers.utils.formatUnits(trade.amount, tradeDecimals)) /
            Number(ethers.utils.formatUnits(base.amount, baseDecimals))).toFixed(4),
        amount: ethers.utils.formatUnits(trade.amount, tradeDecimals),
        type,
        ticker: await toTicker([base, trade], provider),
    };
}
