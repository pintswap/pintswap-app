import { IOffer } from '@pintswap/sdk';
import { IPricesStoreProps } from '../stores';
import { calculatePrices } from './math';

// PRICES
export const renderPrices = async ({
    base,
    quote,
    prices,
    trade,
}: {
    base?: string;
    quote?: string;
    prices?: IPricesStoreProps;
    trade?: IOffer;
}) => {
    if (!base || !quote || !trade || !prices) return { usd: '0', eth: '0' };
    switch (base?.toLowerCase()) {
        case 'eth':
        case 'weth':
            return {
                usd: (Number(quote) * Number(prices.eth)).toString(),
                eth: Number(quote).toString(),
            };
        case 'usdc':
        case 'usdt':
        case 'dai':
            return {
                usd: Number(quote).toString(),
                eth: (Number(quote) / Number(prices.eth)).toString(),
            };
        default:
            return await calculatePrices({
                tokenA: trade?.gives?.token,
                amountA: trade?.gives?.amount,
                tokenB: trade?.gets?.token,
                amountB: trade?.gets?.amount,
                eth: prices.eth,
            });
    }
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

// CSS CLASS
export function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

export const dropdownItemClass = (active: boolean) =>
    classNames(
        active ? 'bg-neutral-900 text-neutral-200' : 'text-neutral-300',
        'flex items-center gap-2 px-4 py-2 text-sm transition duration-100 w-full',
    );
