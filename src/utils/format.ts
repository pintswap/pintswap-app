// STRING
export function truncate(s: string, amount?: number) {
    if (!s) return s;
    if (s.match(/\.drip$/)) return s;
    return `${s.slice(0, amount ? amount : 4)}...${s.slice(amount ? amount * -1 : -4)}`;
}

export const shorten = (s: string) => {
    if (s.match(/\.drip$/)) return s;
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
    if (s.startsWith('Q') && s.length > 30) return shorten(s);
    return s;
};

// CSS CLASS
export function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}
