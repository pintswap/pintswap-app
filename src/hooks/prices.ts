import { isAddress } from 'ethers6';
import { useEffect, useState } from 'react';
import { tryBoth } from '../api';
import { TOKENS_BY_SYMBOL } from '../utils';
import { usePricesContext } from '../stores';
import { IOffer, ITransfer } from '@pintswap/sdk';

export const calculatePrices = async ({
    gives,
    gets,
    eth,
}: {
    gives?: ITransfer;
    gets?: ITransfer;
    eth?: string;
}) => {
    if (!gives?.token || !gets?.token || !gives?.amount || !gets?.amount || !eth)
        return { eth: '0', usd: '0' };
    try {
        const addressA = isAddress(gives?.token)
            ? gives?.token
            : TOKENS_BY_SYMBOL[gives?.token]?.address;
        const addressB = isAddress(gets?.token)
            ? gets?.token
            : TOKENS_BY_SYMBOL[gets?.token]?.address;
        if (addressA && addressB) {
            const { token: aToken } = await tryBoth({ address: addressA });
            const { token: bToken } = await tryBoth({ address: addressB });

            const ethPrice =
                (Number(gets?.amount) * Number(bToken.derivedETH)) /
                (Number(gives?.amount) * Number(aToken.derivedETH));
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

export const renderPrices = async ({
    base,
    quote,
    eth,
    gives,
    gets,
}: {
    base?: string;
    quote?: string;
    eth: string;
    gives?: ITransfer;
    gets?: ITransfer;
}) => {
    if (!base || !quote || !gives || !gets || !eth) return { usd: '0', eth: '0' };
    switch (base?.toLowerCase()) {
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
            return await calculatePrices({
                gives,
                gets,
                eth,
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
    const { eth } = usePricesContext();
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
                    eth,
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
