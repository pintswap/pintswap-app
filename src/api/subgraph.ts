import { ethers, Signer, ZeroAddress } from 'ethers6';
import {
    decimalsCache,
    ENDPOINTS,
    formatPintswapTrade,
    getChainId,
    priceCache,
    subgraphTokenCache,
    symbolCache,
    TESTING,
    toAddress,
} from '../utils';
import { IOffer } from '@pintswap/sdk';

const JSON_HEADER_POST = { method: 'POST', headers: { 'Content-Type': 'application/json' } };
const ETH_RES = {
    id: ZeroAddress,
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: '18',
    derivedETH: '1',
};

export async function getV3Token({
    address,
    history,
    chainId,
}: {
    address?: string;
    history?: 'day' | 'hour';
    chainId?: number;
}): Promise<{
    token: any;
    tokenDayDatas: any[];
    tokenHourDatas: any[];
}> {
    if (!address) return { token: undefined, tokenDayDatas: [], tokenHourDatas: [] };
    if (address === ZeroAddress) return { token: ETH_RES, tokenDayDatas: [], tokenHourDatas: [] };

    const formattedAddress = ethers.getAddress(address);
    const buildParams = () => {
        return `(id: "${formattedAddress}")`;
    };

    const buildOptionalQuery = () => {
        if (!history) return '';
        if (history === 'day') {
            return `
        tokenDayDatas (where: { token: "${formattedAddress}" }) {
          id
          date
          volumetotalValueLockedUSD_gte
          volumeUSD
          totalValueLocked
          totalValueLockedUSD
          priceUSD
          feesUSD
          open
          high
          low
          close
        }`;
        } else {
            return `
        tokenHourDatas (where: { token: "${formattedAddress}" }) {
          id
          periodStartUnix
          volume
          volumeUSD
          totalValueLocked
          totalValueLockedUSD
          priceUSD
          feesUSD
          open
          high
          low
          close
        }`;
        }
    };

    try {
        const determineUniGraph = () => {
            if (chainId === 42161) return 'arb';
            if (chainId === 43114) return 'avax';
            return 'v3';
        };
        const determineQuery = () => {
            if (chainId === 43114) {
                return `
                id
                name
                symbol
                decimals
                lastPriceUSD
                `;
            } else {
                return `
                id
                symbol
                name
                decimals    
                derivedETH
                `;
            }
        };
        const response = await fetch(ENDPOINTS['uniswap'][determineUniGraph()], {
            ...JSON_HEADER_POST,
            body: JSON.stringify({
                query: `{
              token ${buildParams()} {
                ${determineQuery()}
              }
              ${buildOptionalQuery()}
            }`,
            }),
        });
        const { data, errors, error } = await response.json();
        if (errors || error || !data?.token) {
            console.error('#getV3Token', errors, error);
            return { token: null, tokenDayDatas: [], tokenHourDatas: [] };
        }
        return {
            token: data?.token,
            tokenDayDatas: data?.tokenDayDatas,
            tokenHourDatas: data?.tokenHourDatas,
        };
    } catch (err) {
        console.error('#getV3Token', err);
        return { token: null, tokenDayDatas: [], tokenHourDatas: [] };
    }
}

export async function getV2Token({
    address,
    history,
}: {
    address?: string;
    history?: 'day' | 'hour';
}): Promise<{
    token: any;
    tokenDayDatas: any[];
}> {
    if (!address) return { token: undefined, tokenDayDatas: [] };
    if (address === ZeroAddress) return { token: ETH_RES, tokenDayDatas: [] };
    const formattedAddress = ethers.getAddress(address).toLowerCase();

    const buildOptionalQuery = () => {
        if (!history || history === 'hour') return '';
        return `
        tokenDayDatas (orderBy: date, orderDirection: desc, first: 3, where: { token: "${formattedAddress}" }) {
          dailyVolumeUSD
          dailyTxns
          totalLiquidityUSD
          priceUSD
        }`;
    };
    try {
        const response = await fetch(ENDPOINTS['uniswap']['v2'], {
            ...JSON_HEADER_POST,
            body: JSON.stringify({
                query: `{
              token (id: "${formattedAddress}") {
                id
                symbol
                name
                decimals
                derivedETH
              }
              ${buildOptionalQuery()}
            }`,
            }),
        });
        const {
            data: { token, tokenDayDatas },
            errors,
            error,
        } = await response.json();
        if (errors || error) console.error('#getV2Token', errors, error);
        return { token, tokenDayDatas };
    } catch (err) {
        try {
            const response = await fetch(ENDPOINTS['uniswap']['v2Fallback'], {
                ...JSON_HEADER_POST,
                body: JSON.stringify({
                    query: `{
                  token (id: "${formattedAddress}") {
                    id
                    symbol
                    name
                    decimals
                    lastPriceUSD
                  }
                  ${buildOptionalQuery()}
                }`,
                }),
            });
            const {
                data: { token, tokenDayDatas },
                errors,
                error,
            } = await response.json();
            if (errors || error) console.error('#getV2Token', errors, error);
            return { token, tokenDayDatas };
        } catch (err) {
            console.error('#getV2Token', err);
            return { token: null, tokenDayDatas: [] };
        }
    }
}

export async function getUniswapToken(props: {
    address?: string;
    history?: 'day' | 'hour';
    chainId?: number;
}) {
    if (!props || !props.address) return { token: null, tokenDayDatas: [], tokenHourDatas: [] };
    const chainId = props.chainId ? props.chainId : getChainId();
    switch (chainId) {
        case 1: {
            if (subgraphTokenCache[chainId][props.address])
                return subgraphTokenCache[chainId][props.address];
            const v2Token = await getV2Token(props);
            if (v2Token?.token) {
                if (!subgraphTokenCache[chainId][props.address])
                    subgraphTokenCache[chainId][props.address] = v2Token;
                if (!decimalsCache[chainId][props.address])
                    decimalsCache[chainId][props.address] = Number(v2Token.token?.decimals);
                if (!symbolCache[chainId][props.address])
                    symbolCache[chainId][props.address] = v2Token.token?.symbol;
                return v2Token;
            }
            const v3Token = await getV3Token(props);
            if (v3Token?.token) {
                if (!subgraphTokenCache[chainId][props.address])
                    subgraphTokenCache[chainId][props.address] = v3Token;
                if (!decimalsCache[chainId][props.address])
                    decimalsCache[chainId][props.address] = Number(v3Token.token?.decimals);
                if (!symbolCache[chainId][props.address])
                    symbolCache[chainId][props.address] = v3Token.token?.symbol;
                return v3Token;
            }
            return { token: null };
        }
        default: {
            if (subgraphTokenCache[chainId][props.address])
                return subgraphTokenCache[chainId][props.address];
            const v3Token = await getV3Token({ ...props, chainId });
            if (v3Token?.token) {
                if (!subgraphTokenCache[chainId][props.address])
                    subgraphTokenCache[chainId][props.address] = v3Token;
                if (!decimalsCache[chainId][props.address])
                    decimalsCache[chainId][props.address] = Number(v3Token.token?.decimals);
                if (!symbolCache[chainId][props.address])
                    symbolCache[chainId][props.address] = v3Token.token?.symbol;
                return v3Token;
            }
            return { token: null };
        }
    }
}

export async function getManyV2Tokens(addresses: string[]): Promise<any[]> {
    if (!addresses) return [];
    const validAddresses = addresses.filter((t) => ethers.isAddress(t));
    const promises = await Promise.all(
        validAddresses.map(async (token) => getV2Token({ address: token })),
    );
    return promises;
}

export async function getEthPrice(): Promise<string> {
    const chainId = getChainId();
    if (priceCache[chainId][ZeroAddress]) return priceCache[chainId][ZeroAddress];
    const response = await fetch(ENDPOINTS['uniswap']['v3'], {
        ...JSON_HEADER_POST,
        body: JSON.stringify({
            query: `{
          bundles {
            ethPriceUSD
          }
        }`,
        }),
    });
    const {
        data: { bundles },
    } = await response.json();
    if (!priceCache[chainId][ZeroAddress])
        priceCache[chainId][ZeroAddress] = bundles[0].ethPriceUSD;
    return bundles[0].ethPriceUSD;
}

export async function getUserHistory(address: string, signer: Signer) {
    const params = ['taker', 'maker'];
    const res = await Promise.all(
        Object.keys(ENDPOINTS['pintswap']).map(
            async (ep) =>
                await Promise.all(
                    params.map(async (el) => {
                        return await (
                            await fetch(ENDPOINTS['pintswap'][ep], {
                                ...JSON_HEADER_POST,
                                body: JSON.stringify({
                                    query: `{
                        pintswapTrades(
                            orderBy: timestamp, 
                            orderDirection: desc,
                            where: { ${el}: "${address.toLowerCase()}" }
                        ) {
                            id
                            timestamp
                            chainId
                            pair
                            maker
                            taker
                            gets {
                              amount
                              token
                            }
                            gives {
                              amount
                              token
                            }
                          }
                    }`,
                                }),
                            })
                        ).json();
                    }),
                ),
        ),
    );
    if (res.length) {
        const returnList: any[] = [];
        res.flat().forEach(({ data }) =>
            data.pintswapTrades.forEach((t: any) => returnList.push(t)),
        );
        return await Promise.all(returnList.map(formatPintswapTrade));
    } else {
        return [];
    }
}

export async function getQuote(
    trade: IOffer,
    ethPrice: string,
    type?: 'conservative' | 'exact',
): Promise<string> {
    if (trade.gives.amount && trade.gives.token && trade.gets.token) {
        let givesPrice: string;
        if ((trade.gives.token === 'ETH' || trade.gives.token === 'WETH') && ethPrice) {
            givesPrice = trade.gives.amount;
        } else {
            const givesDetails = await getUniswapToken({ address: toAddress(trade.gives.token) });
            if (givesDetails?.token?.derivedETH) {
                givesPrice = (
                    Number(givesDetails?.token?.derivedETH || '0') * Number(trade.gives.amount)
                ).toString();
            } else {
                givesPrice = (
                    Number(givesDetails?.token?.lastPriceUSD || '0') * Number(trade.gives.amount)
                ).toString();
            }
        }

        const getsDetails = await getUniswapToken({ address: toAddress(trade.gets.token) });
        let getsPrice: string;
        if (getsDetails?.token?.derivedETH) {
            getsPrice = getsDetails?.token?.derivedETH || '0';
        } else {
            getsPrice = getsDetails?.token?.lastPriceUSD || '0';
        }

        let quote = Number(givesPrice) / Number(getsPrice);
        if (!getsDetails?.token?.derivedETH) quote = quote * Number(ethPrice);
        if (quote === 0) return '';
        if (type === 'exact') return quote.toString();
        return (Math.round(quote * 10000) / 10000).toString(); // round down to nearest 4 decimal places
    }
    return '0';
}
