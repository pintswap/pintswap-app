import { getAddress, isAddress, formatUnits, ZeroAddress } from 'ethers6';
import { ITokenResProps } from '../stores';

// REQUEST OPTIONS
const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
    },
};

const baseUrl = 'https://api.ethplorer.io';

export const getTokenBalances = async (address: string): Promise<ITokenResProps[] | undefined> => {
    if (!address || !isAddress(address)) return [];

    const url = `${baseUrl}/getAddressInfo/${getAddress(address)}?apiKey=${
        process.env.REACT_APP_ETHPLORER_KEY
    }&showTxsCount=false&showETHTTotals=false`;
    fetch(url, options)
        .then((res) => res.json())
        .then((json: { ETH: any; tokens: any[] }) => {
            const final: ITokenResProps[] = [];

            final.push({
                symbol: 'ETH',
                address: ZeroAddress,
                decimals: 18,
                balance: formatUnits(json.ETH?.rawBalance),
            });

            json.tokens?.length &&
                json.tokens?.forEach((t) => {
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
            console.log('#getTokenHoldings:', final);
            return final;
        })
        .catch((err) => {
            console.error('#getTokenBalances:', err);
            return [];
        });
};

export const matchWithUserBalances = (address: string, arr: ITokenResProps[]) => {
    if (!address || !arr) return '0';
    const found = arr.find((x) => x.address?.toLowerCase() === address?.toLowerCase());
    if (found) return found.balance;
    return '0';
};
