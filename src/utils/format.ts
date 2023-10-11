import { Signer, formatUnits } from 'ethers6';
import { getDecimals, getSymbol } from './token';
import { providerFromChainId } from './provider';

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

export const numberFormatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
});
