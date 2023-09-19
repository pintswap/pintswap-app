import { ethers, Signer } from 'ethers6';
import { ENDPOINTS, formatPintswapTrade, toAddress } from '../utils';
import { IOffer } from '@pintswap/sdk';

const JSON_HEADER_POST = { method: 'POST', headers: { 'Content-Type': 'application/json' } };

export async function getV3Token({
    address,
    history,
}: {
    address?: string;
    history?: 'day' | 'hour';
}): Promise<{
    token: any;
    tokenDayDatas: any[];
    tokenHourDatas: any[];
}> {
    if (!address) return { token: undefined, tokenDayDatas: [], tokenHourDatas: [] };

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
        const response = await fetch(ENDPOINTS['uniswap']['v3'], {
            ...JSON_HEADER_POST,
            body: JSON.stringify({
                query: `{
              token ${buildParams()} {
                id
                symbol
                name
                decimals
                totalSupply
                volume
                volumeUSD
                feesUSD
                txCount
                poolCount
                totalValueLocked
                totalValueLockedUSD
                derivedETH
              }
              ${buildOptionalQuery()}
            }`,
            }),
        });
        const {
            data: { token, tokenDayDatas, tokenHourDatas },
            errors,
            error,
        } = await response.json();
        if (errors || error) console.error('#getV3Token', errors, error);
        return { token, tokenDayDatas, tokenHourDatas };
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
        if (errors || error) console.error('#getV2Tokens', errors, error);
        return { token, tokenDayDatas };
    } catch (err) {
        console.error('#getV2Tokens', err);
        return { token: null, tokenDayDatas: [] };
    }
}

export async function tryBoth(props: { address?: string; history?: 'day' | 'hour' }) {
    if (!props) return { token: null, tokenDayDatas: [], tokenHourDatas: [] };
    const v2Token = await getV2Token(props);
    if (v2Token?.token) return v2Token;
    const v3Token = await getV3Token(props);
    if (v3Token?.token) return v3Token;
    return { token: null };
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
    return bundles[0].ethPriceUSD;
}

export async function getUserHistory(address: string, signer: Signer) {
    const params = ['taker', 'maker'];
    const res = await Promise.all(
        params.map(async (el) => {
            return await (
                await fetch(ENDPOINTS['pintswap'], {
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
    );
    if (res.length) {
        const [taker, maker] = res;
        return await Promise.all(
            taker?.data?.pintswapTrades
                .concat(maker?.data?.pintswapTrades)
                .map(formatPintswapTrade),
        );
    } else {
        return [];
    }
}

export async function getQuote(
    trade: IOffer,
    ethPrice: string,
    type?: 'conservative' | 'exact',
): Promise<string> {
    if (
        trade.gives.amount &&
        trade.gives.token &&
        trade.gets.token &&
        (!trade.gets.amount || Number(trade.gets.amount) === 0)
    ) {
        let givesEthPrice: string;
        if ((trade.gives.token === 'ETH' || trade.gives.token === 'WETH') && ethPrice) {
            givesEthPrice = trade.gives.amount;
        } else {
            givesEthPrice = (
                Number(
                    (await tryBoth({ address: toAddress(trade.gives.token) }))?.token?.derivedETH ||
                        '0',
                ) * Number(trade.gives.amount)
            ).toString();
        }
        const getsEthPrice =
            (await tryBoth({ address: toAddress(trade.gets.token) }))?.token?.derivedETH || '0';
        const quote = Number(givesEthPrice) / Number(getsEthPrice);
        if (type === 'exact') return quote.toString();
        return (Math.round(quote * 9990) / 10000).toString(); // round down to nearest 4 decimal places
    }
    return '0';
}
