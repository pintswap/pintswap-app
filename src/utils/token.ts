import { TESTING, TOKENS_BY_ADDRESS, TOKENS_BY_SYMBOL } from './constants';
import { maybeShorten } from './format';
import { ITokenProps, TOKENS } from './token-list';
import { ethers } from 'ethers6';

export const decimalsCache: any = {};
export const symbolCache: any = {};
export const reverseSymbolCache: any = {};

export function toAddress(symbolOrAddress: string): string {
    if (!symbolOrAddress) return '';
    const token = TOKENS_BY_SYMBOL[symbolOrAddress];
    if (token) return ethers.getAddress(token.address);
    if (String(symbolOrAddress).substr(0, 2) !== '0x' && reverseSymbolCache[symbolOrAddress])
        return ethers.getAddress(reverseSymbolCache[symbolOrAddress]);
    if (symbolOrAddress?.startsWith('0x')) return ethers.getAddress(symbolOrAddress);
    return '';
}

export function fromAddress(symbolOrAddress: string): string {
    return (TOKENS_BY_ADDRESS[symbolOrAddress] || { address: symbolOrAddress }).symbol;
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
            const symbol = await contract.symbol();
            symbolCache[address] = symbol;
            if (!reverseSymbolCache[symbol]) reverseSymbolCache[symbol] = address;
        } catch (e) {
            console.warn('#getSymbol: error', e);
            symbolCache[address] = address;
        }
        return symbolCache[address];
    }
}

export const alphaTokenSort = (a: ITokenProps, b: ITokenProps) => {
    const textA = a.symbol.toUpperCase();
    const textB = b.symbol.toUpperCase();
    return textA < textB ? -1 : textA > textB ? 1 : 0;
};

export async function getTokenAttributes(
    token: string,
    provider: any,
    attribute?: keyof ITokenProps,
) {
    let found;
    if (!token) return token;
    if (ethers.isAddress(token)) {
        found = TOKENS.find((el) => el.address.toLowerCase() === token.toLowerCase());
    } else {
        found = TOKENS.find((el) => el.symbol.toLowerCase() === (token as string).toLowerCase());
    }
    if (found) {
        if (attribute) return found[attribute];
        else return found;
    } else {
        if (ethers.isAddress(token)) {
            try {
                const symbol = await getSymbol(token, provider);
                const decimals = await getDecimals(token, provider);
                if (!reverseSymbolCache[symbol]) reverseSymbolCache[symbol] = token;
                const tokenAttributes = {
                    asset: '',
                    type: 'ERC20',
                    address: token,
                    name: '',
                    symbol,
                    decimals,
                    logoURI: '/img/generic.svg',
                };
                if (TESTING) console.log('#getTokenAttributes:', tokenAttributes);
                if (attribute) return tokenAttributes[attribute];
                return tokenAttributes;
            } catch (err) {
                console.warn('#getTokenAttributes: Error finding token', {
                    token,
                    found,
                });
                return token;
            }
        }
        console.warn('#getTokenAttributes: Error finding token', {
            token,
            found,
        });
        return token;
    }
}

export async function getDecimals(token: string, provider: any) {
    if (ethers.isAddress(token)) {
        const address = ethers.getAddress(token);
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
    } else {
        const found = TOKENS.find(
            (el) => el.symbol.toLowerCase() === (token as string).toLowerCase(),
        );
        return found?.decimals || 18;
    }
}

export async function convertAmount(
    to: 'hex' | 'number' | 'readable',
    amount: string,
    token: string,
    provider: any,
) {
    let output;
    if (to === 'hex') {
        if (amount.startsWith('0x')) output = amount;
        else output = ethers.toBeHex(ethers.parseUnits(amount, await getDecimals(token, provider)));
    } else {
        if (amount.startsWith('0x'))
            output = ethers.formatUnits(amount, await getDecimals(token, provider));
        else output = amount;
    }
    if (TESTING) console.log('#convertAmount:', { amount, token, output });
    return to === 'readable'
        ? `${output}  ${(await getTokenAttributes(token, provider, 'symbol')) || 'N/A'}`
        : output;
}

export function getTokenLogo(token: string) {
    let found;
    if (!token) return token;
    if (token.startsWith('0x')) {
        found = TOKENS.find((el) => el.address.toLowerCase() === token.toLowerCase());
    } else {
        found = TOKENS.find((el) => el.symbol.toLowerCase() === token.toLowerCase());
    }
    if (found) return found.logoURI.toString();
    else return '/img/generic.svg';
}
