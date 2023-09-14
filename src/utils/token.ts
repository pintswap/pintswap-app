import { ITransfer } from '@pintswap/sdk';
import {
    TESTING,
    getTokenListByAddress,
    getTokenListBySymbol,
    getTokenList,
    DEFAULT_CHAINID,
} from './constants';
import { maybeShorten } from './format';
import { ITokenProps } from './types';
import { isAddress, getAddress, Contract, toBeHex, parseUnits, formatUnits, Signer } from 'ethers6';
import { chainIdFromProvider, providerFromChainId } from './provider';

export const decimalsCache: any = {};
export const symbolCache: any = {};
export const reverseSymbolCache: any = {};

export function toAddress(symbolOrAddress: string, chainId: number): string {
    if (!symbolOrAddress) return '';
    const token = getTokenListBySymbol(chainId)[symbolOrAddress];
    if (token) return getAddress(token.address);
    if (String(symbolOrAddress).substr(0, 2) !== '0x' && reverseSymbolCache[symbolOrAddress])
        return getAddress(reverseSymbolCache[symbolOrAddress]);
    if (symbolOrAddress?.startsWith('0x')) return getAddress(symbolOrAddress);
    return '';
}

export function fromAddress(symbolOrAddress: string, chainId: number): string {
    return (getTokenListByAddress(chainId)[symbolOrAddress] || { address: symbolOrAddress }).symbol;
}

export async function toTicker(pair: any, provider?: Signer) {
    if (!pair || !provider) return '';
    const flipped = [...pair].reverse();
    return (
        await Promise.all(
            flipped.map(async (v: any) => maybeShorten(await getSymbol(v.address, provider))),
        )
    ).join('/');
}

export const getTokenAddress = (token: ITokenProps | undefined, raw: ITransfer) => {
    if (token?.address) return token.address;
    else if (raw?.token) {
        if (isAddress(raw?.token)) return raw.token;
        if (reverseSymbolCache[raw?.token]) return reverseSymbolCache[raw?.token];
    } else return '';
};

export async function getSymbol(address?: string, provider?: Signer) {
    if (!address || !provider) return address || '';
    address = getAddress(address);
    const activeChainId = await chainIdFromProvider(provider);
    const match = getTokenList(activeChainId).find((v) => getAddress(v.address) === address);
    if (match) return match.symbol;
    else if (symbolCache[address]) {
        return symbolCache[address];
    } else {
        const contract = new Contract(
            address,
            ['function symbol() view returns (string)'],
            provider,
        );
        try {
            const symbol = await contract.symbol();
            symbolCache[address] = symbol;
            if (!reverseSymbolCache[symbol]) reverseSymbolCache[symbol] = address;
        } catch (e) {
            try {
                const mainnetTry = await new Contract(
                    address,
                    ['function symbol() view returns (string)'],
                    providerFromChainId(1),
                ).symbol();
                symbolCache[address] = mainnetTry || address;
            } catch (err) {
                symbolCache[address] = address;
            }
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
    provider: Signer,
    attribute?: keyof ITokenProps,
) {
    let found;
    if (!token) return token;
    const activeChainId = await chainIdFromProvider(provider);
    if (isAddress(token)) {
        found = getTokenList(activeChainId).find(
            (el) => el.address.toLowerCase() === token.toLowerCase(),
        );
    } else {
        found = getTokenList(activeChainId).find(
            (el) => el.symbol.toLowerCase() === (token as string).toLowerCase(),
        );
    }
    if (found) {
        if (attribute) return found[attribute];
        else return found;
    } else {
        if (isAddress(token)) {
            try {
                const symbol = await getSymbol(token, provider);
                const decimals = await getDecimals(token, provider);
                if (!reverseSymbolCache[symbol]) reverseSymbolCache[symbol] = token;
                const tokenAttributes = {
                    chainId: activeChainId,
                    address: token,
                    name: '',
                    symbol,
                    decimals,
                    logoURI: '/img/generic.svg',
                    extensions: undefined,
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

export async function getDecimals(token: string, provider: Signer) {
    const activeChainId = await chainIdFromProvider(provider);
    if (isAddress(token)) {
        const address = getAddress(token);
        const match = getTokenList(activeChainId).find((v) => getAddress(v.address) === address);
        if (match) return match.decimals;
        else if (decimalsCache[address]) {
            return decimalsCache[address];
        } else {
            try {
                const contract = new Contract(
                    address,
                    ['function decimals() view returns (uint8)'],
                    provider,
                );
                decimalsCache[address] = Number(await contract.decimals());
                return decimalsCache[address];
            } catch (err) {
                try {
                    const mainnetTry = await new Contract(
                        address,
                        ['function decimals() view returns (uint8)'],
                        providerFromChainId(1),
                    ).decimals();
                    return mainnetTry || 18;
                } catch (err) {
                    return 18;
                }
            }
        }
    } else {
        const found = getTokenList(activeChainId).find(
            (el) => el.symbol.toLowerCase() === (token as string).toLowerCase(),
        );
        return found?.decimals || 18;
    }
}

export async function convertAmount(
    to: 'hex' | 'number' | 'readable',
    amount: string,
    token: string,
    provider: Signer,
) {
    let output;
    if (to === 'hex') {
        if (amount.startsWith('0x')) output = amount;
        else output = toBeHex(parseUnits(amount, await getDecimals(token, provider)));
    } else {
        if (amount.startsWith('0x'))
            output = formatUnits(amount, await getDecimals(token, provider));
        else output = amount;
    }
    if (TESTING) console.log('#convertAmount:', { amount, token, output });
    return to === 'readable'
        ? `${output}  ${(await getTokenAttributes(token, provider, 'symbol')) || ''}`
        : output;
}

export function getTokenLogo(token: string, chainId: number) {
    let found;
    if (!token) return token;
    if (token.startsWith('0x')) {
        found = getTokenList(chainId).find(
            (el) => el.address.toLowerCase() === token.toLowerCase(),
        );
    } else {
        found = getTokenList(chainId).find((el) => el.symbol.toLowerCase() === token.toLowerCase());
    }
    if (found) return found.logoURI.toString();
    else return '/img/generic.svg';
}
