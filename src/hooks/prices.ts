import { formatUnits, isAddress } from 'ethers6';
import { useEffect, useState } from 'react';
import { getUniswapToken, getEthPrice } from '../api';
import { getChainId, getTokenListBySymbol, priceCache } from '../utils';
import { ITransfer, detectTradeNetwork } from '@pintswap/sdk';

export const calculatePrices = async ({ gives, gets }: { gives?: ITransfer; gets?: ITransfer }) => {
    const _chainId = await detectTradeNetwork({ gives, gets });
    let chainId = _chainId ? _chainId : getChainId();
    if (!gives?.token || !gets?.token || !gives?.amount || !gets?.amount)
        return { eth: '0', usd: '0' };
    if (priceCache[chainId][`${gives.token}-${gets.token}`])
        return priceCache[chainId][`${gives.token}-${gets.token}`];

    let returnObj;
    try {
        const eth = await getEthPrice();
        const addressA = isAddress(gives?.token)
            ? gives?.token
            : getTokenListBySymbol(chainId)[gives?.token]?.address;
        const addressB = isAddress(gets?.token)
            ? gets?.token
            : getTokenListBySymbol(chainId)[gets?.token]?.address;
        if (addressA && addressB) {
            const { token: aToken } = await getUniswapToken({ address: addressA });
            const { token: bToken } = await getUniswapToken({ address: addressB });
            const aAmount = gives?.amount.startsWith('0x')
                ? formatUnits(gives.amount, Number(aToken?.decimals || '18'))
                : gives?.amount;
            const bAmount = gets?.amount.startsWith('0x')
                ? formatUnits(gets.amount, Number(bToken?.decimals || '18'))
                : gets?.amount;
            if (aToken?.derivedETH && bToken?.derivedETH) {
                const ethPrice =
                    (Number(bAmount) * Number(bToken?.derivedETH)) /
                    (Number(aAmount) * Number(aToken?.derivedETH));
                returnObj = {
                    eth: ethPrice.toString(),
                    usd: (ethPrice * Number(eth)).toString(),
                };
            } else {
                const usdPrice =
                    (Number(bAmount) * Number(bToken?.lastPriceUSD)) /
                    (Number(aAmount) * Number(aToken?.lastPriceUSD));
                returnObj = {
                    usd: usdPrice.toString(),
                    eth: (usdPrice / Number(eth)).toString(),
                };
            }
        } else {
            returnObj = {
                eth: '0',
                usd: '0',
            };
        }
        if (!priceCache[chainId][`${gives.token}-${gets.token}`])
            priceCache[chainId][`${gives.token}-${gets.token}`] = returnObj;
        return returnObj;
    } catch (err) {
        console.error('#calculatePrices', err);
        return {
            eth: '0',
            usd: '0',
        };
    }
};

export const renderPrices = async ({
    base,
    quote,
    gives,
    gets,
}: {
    base?: string;
    quote?: string;
    gives?: ITransfer;
    gets?: ITransfer;
}) => {
    if (!base || !quote || !gives || !gets) return { usd: '0', eth: '0' };
    const eth = await getEthPrice();
    switch (base?.trim().toLowerCase()) {
        case 'eth':
        case 'weth':
            return {
                usd: (Number(quote) * Number(eth)).toString(),
                eth: Number(quote).toString(),
            };
        case 'usdc':
        case 'usdt':
        case 'dai':
            return {
                usd: Number(quote).toString(),
                eth: (Number(quote) / Number(eth)).toString(),
            };
        default:
            console.log('\n\noffer entering calculatePrices', { gives, gets });
            return await calculatePrices({
                gives,
                gets,
            });
    }
};

export const usePrices = ({
    baseAsset,
    quotePrice,
    gives,
    gets,
}: {
    baseAsset?: string;
    quotePrice?: string;
    gives?: ITransfer;
    gets?: ITransfer;
}) => {
    const [data, setData] = useState({ eth: '0', usd: '0' });
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            setData(
                await renderPrices({
                    base: baseAsset,
                    quote: quotePrice,
                    gives,
                    gets,
                }),
            );
            setIsLoading(false);
        })().catch((err) => {
            console.error(err);
            setIsError(true);
            setIsLoading(false);
        });
    }, [baseAsset, quotePrice, gives, gets]);

    return {
        data,
        isLoading,
        isError,
    };
};
