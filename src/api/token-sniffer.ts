import { ZeroAddress, getAddress, isAddress } from 'ethers6';
import { DAI, USDC, USDT, tokenTaxCache } from '../utils';

// CONFIG
const options = { method: 'GET', headers: { accept: 'application/json' } };
const baseUrl = 'https://tokensniffer.com/api/v2';
const apiKey = process.env.REACT_APP_TOKEN_SNIFFER_KEY;
const defaultReturn = { buy: 0, sell: 0 };

export const getTokenTax = async (
    address: string,
    chainId: number = 1,
): Promise<{ buy: number; sell: number }> => {
    if (
        !address ||
        !isAddress(address) ||
        address === ZeroAddress ||
        address === USDC(chainId)?.address ||
        address === USDT(chainId)?.address ||
        address === DAI(chainId)?.address
    )
        return defaultReturn;
    const _address = getAddress(address);
    if (_address === getAddress('0x58fB30A61C218A3607e9273D52995a49fF2697Ee')) {
        const returnObj = { buy: 5, sell: 5 };
        if (!tokenTaxCache[chainId][_address]) tokenTaxCache[chainId][_address] = returnObj;
        return returnObj;
    }
    if (tokenTaxCache[chainId][_address]) return tokenTaxCache[chainId][_address];
    if (!apiKey) return defaultReturn;

    const url = `${baseUrl}/tokens/1/${_address}?apikey=${apiKey}&include_metrics=true&include_tests=false`;

    try {
        const res = await fetch(url, options);
        const json = await res.json();
        if (json?.swap_simulation) {
            const { buy_fee, sell_fee } = json.swap_simulation;
            const returnObj = { buy: buy_fee || 0, sell: sell_fee || 0 };
            if (!tokenTaxCache[chainId][_address]) tokenTaxCache[chainId][_address] = returnObj;
            return { buy: buy_fee || 0, sell: sell_fee || 0 };
        }
        return defaultReturn;
    } catch (err) {
        console.error('#getTokenTax:', err);
        return defaultReturn;
    }
};
