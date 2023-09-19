import { ITransfer } from '@pintswap/sdk';
import {
    TESTING,
    getTokenListByAddress,
    getTokenListBySymbol,
    getTokenList,
    MIN_ABIS,
} from './constants';
import { maybeShorten } from './format';
import { ITokenProps } from './types';
import {
    isAddress,
    getAddress,
    Contract,
    toBeHex,
    parseUnits,
    formatUnits,
    ZeroAddress,
} from 'ethers6';
import { providerFromChainId } from './provider';
import {
    reverseSymbolCache,
    symbolCache,
    decimalsCache,
    totalSupplyCache,
    nameCache,
} from './cache';

export function toAddress(symbolOrAddress?: string, chainId = 1): string {
    if (!symbolOrAddress) return '';
    if (symbolOrAddress === ZeroAddress || symbolOrAddress.toUpperCase() === 'ETH')
        return ZeroAddress;
    const token = getTokenListBySymbol(chainId)[symbolOrAddress];
    if (token) return getAddress(token.address);
    if (
        String(symbolOrAddress).substr(0, 2) !== '0x' &&
        reverseSymbolCache[chainId][symbolOrAddress]
    )
        return getAddress(reverseSymbolCache[chainId][symbolOrAddress]);
    if (symbolOrAddress?.startsWith('0x')) return getAddress(symbolOrAddress);
    return '';
}

export function fromAddress(symbolOrAddress: string, chainId: number): string {
    return (getTokenListByAddress(chainId)[symbolOrAddress] || { address: symbolOrAddress }).symbol;
}

export async function toTicker(pair: any, chainId?: number) {
    if (!pair || !chainId) return '';
    const flipped = [...pair].reverse();
    return (
        await Promise.all(
            flipped.map(async (v: any) => maybeShorten(await getSymbol(v.address, chainId))),
        )
    ).join('/');
}

export const getTokenAddress = (
    token: ITokenProps | undefined,
    raw: ITransfer,
    chainId: number,
) => {
    if (token?.address) return token.address;
    else if (raw?.token) {
        if (isAddress(raw?.token)) return raw.token;
        if (reverseSymbolCache[chainId][raw?.token]) return reverseSymbolCache[chainId][raw?.token];
    } else return '';
    return '';
};

export async function getTotalSupply(address: string, chainId: number, type?: 'NFT' | 'ERC20') {
    if (!address || !chainId) return address || '';
    address = getAddress(address);
    if (totalSupplyCache[chainId][address]) return totalSupplyCache[chainId][address];
    const provider = providerFromChainId(chainId);
    const contract = new Contract(address, MIN_ABIS[type || 'NFT'], provider);
    try {
        const totalSupply = await contract?.totalSupply();
        totalSupplyCache[chainId][address] = totalSupply;
        return totalSupply;
    } catch (e) {
        console.error(e);
        return '0';
    }
}

export async function getName(address: string, chainId: number) {
    if (!address || !chainId) return address || '';
    address = getAddress(address);
    if (nameCache[chainId][address]) return nameCache[chainId][address];
    const provider = providerFromChainId(chainId);
    const contract = new Contract(address, ['function name() view returns (string)'], provider);
    try {
        const name = await contract?.name();
        nameCache[chainId][address] = name;
        return name;
    } catch (e) {
        console.error(e);
        return '0';
    }
}

export async function getSymbol(address: string, chainId: number) {
    if (!address || !chainId) return address || '';
    address = getAddress(address);
    if (address === ZeroAddress) return 'ETH';
    if (symbolCache[chainId][address]) return symbolCache[chainId][address];
    const provider = providerFromChainId(chainId);
    const match = getTokenList(chainId).find((v) => getAddress(v.address) === address);
    if (match) return match.symbol;
    else {
        const contract = new Contract(
            address,
            ['function symbol() view returns (string)'],
            provider,
        );
        try {
            const symbol = await contract?.symbol();
            symbolCache[chainId][address] = symbol;
            if (!reverseSymbolCache[chainId][symbol]) reverseSymbolCache[chainId][symbol] = address;
        } catch (e) {
            try {
                if (symbolCache[1][address]) return symbolCache[1][address];
                const mainnetTry = await new Contract(
                    address,
                    ['function symbol() view returns (string)'],
                    providerFromChainId(1),
                )?.symbol();
                if (mainnetTry) symbolCache[1][address] = mainnetTry;
                return mainnetTry;
            } catch (err) {
                return address;
            }
        }
        return symbolCache[chainId][address];
    }
}

export const alphaTokenSort = (a: ITokenProps, b: ITokenProps) => {
    const textA = a.symbol.toUpperCase();
    const textB = b.symbol.toUpperCase();
    return textA < textB ? -1 : textA > textB ? 1 : 0;
};

export const balanceTokenSort = (a: ITokenProps, b: ITokenProps) => {
    const balanceA = Number(a?.balance);
    const balanceB = Number(b?.balance);
    return balanceB - balanceA;
};

export async function getTokenAttributes(
    token: string,
    chainId: number,
    attribute?: keyof ITokenProps,
) {
    let found;
    if (!token) return token;
    if (isAddress(token)) {
        found = getTokenList(chainId).find(
            (el) => el.address.toLowerCase() === token.toLowerCase(),
        );
    } else {
        found = getTokenList(chainId).find(
            (el) => el.symbol.toLowerCase() === (token as string).toLowerCase(),
        );
    }
    if (found) {
        if (attribute) return found[attribute];
        else return found;
    } else {
        if (isAddress(token)) {
            try {
                const symbol = await getSymbol(token, chainId);
                const decimals = await getDecimals(token, chainId);
                if (!reverseSymbolCache[chainId][symbol])
                    reverseSymbolCache[chainId][symbol] = token;
                const tokenAttributes = {
                    chainId: chainId,
                    address: token,
                    name: '',
                    symbol,
                    decimals,
                    logoURI: '/img/generic.svg',
                    extensions: undefined,
                };
                if (TESTING) console.log('#getTokenAttributes:', tokenAttributes);
                if (attribute) return (tokenAttributes as any)[attribute];
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

export async function getDecimals(token: string, chainId: number) {
    if (!token || !chainId) return token || '';
    const provider = providerFromChainId(chainId);
    if (isAddress(token)) {
        const address = getAddress(token);
        if (address === ZeroAddress) return 18;
        const match = getTokenList(chainId).find((v) => getAddress(v?.address) === address);
        if (match) return match?.decimals || 18;
        else if (decimalsCache[chainId][address]) {
            return decimalsCache[chainId][address] || 18;
        } else {
            try {
                const contract = new Contract(
                    address,
                    ['function decimals() view returns (uint8)'],
                    provider,
                );
                const decimals = Number((await contract?.decimals()) || '18');
                decimalsCache[chainId][address] = decimals;
                return decimals || 18;
            } catch (err) {
                try {
                    if (decimalsCache[1][address]) return decimalsCache[1][address];
                    const mainnetTry = await new Contract(
                        address,
                        ['function decimals() view returns (uint8)'],
                        providerFromChainId(1),
                    ).decimals();
                    if (mainnetTry) decimalsCache[1][address] = Number(mainnetTry);
                    return mainnetTry || 18;
                } catch (err) {
                    return 18;
                }
            }
        }
    } else {
        const found = getTokenList(chainId).find(
            (el) => el.symbol.toLowerCase() === (token as string).toLowerCase(),
        );
        return found?.decimals || 18;
    }
}

export async function convertAmount(
    to: 'hex' | 'number' | 'readable',
    amount: string,
    token: string,
    chainId: number,
) {
    let output;
    if (to === 'hex') {
        if (amount.startsWith('0x')) output = amount;
        else output = toBeHex(parseUnits(amount, (await getDecimals(token, chainId)) || 18));
    } else {
        if (amount.startsWith('0x'))
            output = formatUnits(amount, (await getDecimals(token, chainId)) || 18);
        else output = amount;
    }
    if (TESTING) console.log('#convertAmount:', { amount, token, output });
    return to === 'readable'
        ? `${output}  ${(await getTokenAttributes(token, chainId, 'symbol')) || ''}`
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
