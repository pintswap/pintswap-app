import { getAddress, isAddress, formatUnits, ZeroAddress } from 'ethers6';
import { ITokenResProps } from '../stores';
import { TESTING } from '../utils';

// REQUEST OPTIONS
const options = { method: 'GET', headers: { accept: 'application/json' } };

const baseUrl = 'https://api.ethplorer.io';

export const getTokenBalances = async (address: string): Promise<ITokenResProps[] | undefined> => {
    if (!address || !isAddress(address)) return [];

    const url = `${baseUrl}/getAddressInfo/${getAddress(address)}?apiKey=${
        process.env.REACT_APP_ETHPLORER_KEY || 'freekey'
    }&showTxsCount=false&showETHTTotals=false`;

    try {
        const res = await fetch(url, options);
        const json = await res.json();
        const final: ITokenResProps[] = [];

        final.push({
            symbol: 'ETH',
            address: ZeroAddress,
            decimals: 18,
            balance: formatUnits(json.ETH?.rawBalance),
        });

        json.tokens?.length &&
            json.tokens?.forEach((t: any) => {
                if (t?.tokenInfo && t?.tokenInfo?.price) {
                    const decimals = Number(t?.tokenInfo?.decimals || '18');
                    final.push({
                        symbol: t.tokenInfo.symbol,
                        address: getAddress(t.tokenInfo.address),
                        decimals,
                        balance: formatUnits(t?.rawBalance, decimals),
                    });
                }
            });
        if (TESTING) console.log('#getTokenHoldings:', final);
        return final;
    } catch (err) {
        console.error('#getTokenHoldings');
        return [];
    }
};

export const matchWithUserBalances = (address: string, arr: ITokenResProps[]) => {
    if (!address || !arr) return '0';
    const found = arr.find((x) => x.address?.toLowerCase() === address?.toLowerCase());
    if (found) return found.balance;
    return '0';
};
