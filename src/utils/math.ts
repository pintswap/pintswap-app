import { tryBoth } from '../api';
import { isAddress } from 'ethers6';
import { TOKENS_BY_SYMBOL } from './constants';
import { IPricesStoreProps } from '../stores';
import { IOffer } from '@pintswap/sdk';

export const percentChange = (oldVal: string | number, newVal: string | number) => {
    return (((Number(oldVal) - Number(newVal)) / Number(newVal)) * 100).toFixed(2);
};

export const calculatePrices = async ({
    tokenA,
    amountA,
    tokenB,
    amountB,
    eth,
}: {
    tokenA?: string;
    amountA?: string;
    tokenB?: string;
    amountB?: string;
    eth?: string;
}) => {
    if (!tokenA || !tokenB || !amountA || !amountB || !eth) return { eth: '0', usd: '0' };
    try {
        const addressA = isAddress(tokenA) ? tokenA : TOKENS_BY_SYMBOL[tokenA]?.address;
        const addressB = isAddress(tokenB) ? tokenB : TOKENS_BY_SYMBOL[tokenB]?.address;
        if (addressA && addressB) {
            const { token: aToken } = await tryBoth({ address: addressA });
            const { token: bToken } = await tryBoth({ address: addressB });

            const ethPrice =
                (Number(amountB) * Number(bToken.derivedETH)) /
                (Number(amountA) * Number(aToken.derivedETH));
            return {
                eth: ethPrice.toString(),
                usd: (ethPrice * Number(eth)).toString(),
            };
        } else {
            return {
                eth: '0',
                usd: '0',
            };
        }
    } catch (err) {
        console.error('#calculatePrices', err);
        return {
            eth: '0',
            usd: '0',
        };
    }
};
