import { ethers } from 'ethers6';
import { ENDPOINTS } from '../utils';

const JSON_HEADER_POST = { method: 'POST', headers: { 'Content-Type': 'application/json' } };

export async function getV3Token({
    address,
    history,
}: {
    address: string;
    history?: 'day' | 'hour';
}): Promise<{
    token: any;
    tokenDayDatas: any[];
    tokenHourDatas: any[];
}> {
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
    address: string;
    history?: 'day' | 'hour';
}): Promise<{
    token: any;
    tokenDayDatas: any[];
}> {
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
                totalSupply
                tradeVolume
                tradeVolumeUSD
                txCount
                totalLiquidity
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

export async function tryBoth(props: { address: string; history?: 'day' | 'hour' }) {
    if (!props) return { token: null, tokenDayDatas: [], tokenHourDatas: [] };
    const v2Token = await getV2Token(props);
    if (v2Token?.token) return v2Token;
    const v3Token = await getV3Token(props);
    if (v3Token?.token) return v3Token;
    return { token: null };
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
