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
    const flipped = [ ...pair ].reverse();
    return (
        await Promise.all(
            flipped.map(async (v: any) => maybeShorten(await getSymbol(v.address, provider))),
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
    const mapped = {
       ...offer,
       givesToken: ethers.utils.getAddress(offer.givesToken),
       getsToken: ethers.utils.getAddress(offer.getsToken)
    };
    if (mapped.givesToken === USDC.address) {
        return givesBase(mapped);
    } else if (mapped.getsToken === USDC.address) {
        return givesTrade(mapped);
    } else if (mapped.givesToken === USDT.address) {
        return givesBase(mapped);
    } else if (mapped.getsToken === USDT.address) {
        return givesTrade(mapped);
    } else if (mapped.givesToken === DAI.address) {
        return givesBase(mapped);
    } else if (mapped.getsToken === DAI.address) {
        return givesTrade(mapped);
    } else if (mapped.givesToken === ETH.address) {
        return givesBase(mapped);
    } else if (mapped.getsToken === ETH.address) {
        return givesTrade(mapped);
    } else if (Number(mapped.givesToken.toLowerCase()) < Number(mapped.getsToken.toLowerCase())) {
        return givesBase(mapped);
    } else return givesTrade(mapped);
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
            (Number(ethers.utils.formatUnits(base.amount, baseDecimals)) /
            Number(ethers.utils.formatUnits(trade.amount, tradeDecimals))).toFixed(4),
        amount: ethers.utils.formatUnits(trade.amount, tradeDecimals),
        type,
        ticker: await toTicker([base, trade], provider),
    };
}
