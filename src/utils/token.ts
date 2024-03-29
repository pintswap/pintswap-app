import { ITransfer } from '@pintswap/sdk';
import { TESTING, getTokenListByAddress, getTokenListBySymbol, getTokenList } from './constants';
import {
    isAddress,
    getAddress,
    Contract,
    toBeHex,
    parseUnits,
    formatUnits,
    ZeroAddress,
} from 'ethers6';
import { getChainId, providerFromChainId } from './provider';
import {
    reverseSymbolCache,
    symbolCache,
    decimalsCache,
    totalSupplyCache,
    nameCache,
} from './cache';
import { ITokenProps } from './types';
import { MIN_ABIS } from './contracts';

export function toAddress(symbolOrAddress?: string, chainId = 1): string {
    // If nothing
    if (!symbolOrAddress) return '';
    // If address
    if (isAddress(symbolOrAddress)) {
        if (symbolOrAddress === ZeroAddress) return ZeroAddress;
        return getAddress(symbolOrAddress);
    }
    // Standardize if symbol
    const capSymbolOrAddress = (symbolOrAddress as string).toUpperCase();
    if (capSymbolOrAddress === 'ETH' || capSymbolOrAddress === 'AVAX') return ZeroAddress;
    // If in cache
    if (reverseSymbolCache[chainId][capSymbolOrAddress])
        return reverseSymbolCache[chainId][capSymbolOrAddress];
    if (symbolCache[chainId][capSymbolOrAddress]) return symbolCache[chainId][capSymbolOrAddress];
    // If in list
    const token = getTokenListBySymbol(chainId)[capSymbolOrAddress];
    if (token) return getAddress(token.address);
    // else return nothing
    return '';
}

export function fromAddress(symbolOrAddress: string, chainId: number): string {
    const capSymbolOrAddress = symbolOrAddress.startsWith('0x')
        ? symbolOrAddress
        : symbolOrAddress.toUpperCase();
    return (getTokenListByAddress(chainId)[capSymbolOrAddress] || { address: capSymbolOrAddress })
        .symbol;
}

export async function toTicker(pair: any, chainId?: number) {
    if (!pair || !chainId) return '';
    const flipped = [...pair].reverse();
    return (
        await Promise.all(flipped.map(async (v: any) => await getSymbol(v.address, chainId)))
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
    const contract = new Contract(address, MIN_ABIS[type || 'NFT'], provider as any);
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
    if (address === ZeroAddress) {
        if (chainId === 43114) return 'Avalanche';
        return 'Ethereum';
    }
    address = getAddress(address);
    if (nameCache[chainId][address]) return nameCache[chainId][address];
    const match = getTokenList(chainId).find(
        (v) => v?.address?.toLowerCase() === address?.toLowerCase(),
    );
    if (match) return match.name;
    const provider = providerFromChainId(chainId);
    const contract = new Contract(
        address,
        ['function name() view returns (string)'],
        provider as any,
    );
    try {
        const name = await contract?.name();
        nameCache[chainId][address] = name;
        return name;
    } catch (e) {
        console.error(e);
        return '0';
    }
}

export async function getSymbol(address: string, chainId?: number) {
    if (!address || !isAddress(address)) return address || '';
    address = getAddress(address);

    let _chainId: number;
    if (!chainId) _chainId = getChainId();
    else _chainId = chainId;

    if (address === ZeroAddress) {
        if (_chainId === 43114) return 'AVAX';
        return 'ETH';
    }
    if (symbolCache[_chainId][address]) return symbolCache[_chainId][address];
    const provider = providerFromChainId(_chainId);
    const match = getTokenList(_chainId).find(
        (v) => v?.address?.toLowerCase() === address?.toLowerCase(),
    );
    if (match) return match.symbol;
    else {
        const contract = new Contract(
            address,
            ['function symbol() view returns (string)'],
            provider as any,
        );
        try {
            const symbol = await contract?.symbol();
            symbolCache[_chainId][address] = symbol;
            if (!reverseSymbolCache[_chainId][symbol])
                reverseSymbolCache[_chainId][symbol] = address;
        } catch (e) {
            try {
                if (symbolCache[1][address]) return symbolCache[1][address];
                const mainnetTry = await new Contract(
                    address,
                    ['function symbol() view returns (string)'],
                    providerFromChainId(1) as any,
                )?.symbol();
                if (mainnetTry) symbolCache[1][address] = mainnetTry;
                return mainnetTry;
            } catch (err) {
                return address;
            }
        }
        return symbolCache[_chainId][address];
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

export async function getDecimals(token: string, chainId: number): Promise<number> {
    if (!token || !chainId) return 18;
    const provider = providerFromChainId(chainId);
    if (isAddress(token)) {
        const address = getAddress(token);
        if (address === ZeroAddress) return 18;
        const match = getTokenList(chainId).find(
            (v) => v?.address?.toLowerCase() === address?.toLowerCase(),
        );
        if (match) return match?.decimals || 18;
        else if (decimalsCache[chainId][address]) {
            return decimalsCache[chainId][address] || 18;
        } else {
            try {
                const contract = new Contract(
                    address,
                    ['function decimals() view returns (uint8)'],
                    provider as any,
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
                        providerFromChainId(1) as any,
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
    amount: string, // could be token id
    token: string,
    chainId: number,
    isNft?: boolean,
) {
    let output;
    if (isNft && to === 'readable') {
        output = formatUnits(amount, 0);
        return `${(await getTokenAttributes(token, chainId, 'symbol')) || ''} ${output} NFT`;
    }
    if (to === 'hex') {
        if (amount.startsWith('0x')) output = amount;
        else output = toBeHex(parseUnits(amount, (await getDecimals(token, chainId)) || 18));
    } else {
        if (amount.startsWith('0x'))
            output = formatUnits(amount, (await getDecimals(token, chainId)) || 18);
        else output = amount;
    }
    // if (TESTING) console.log('#convertAmount:', { amount, token, output });
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
