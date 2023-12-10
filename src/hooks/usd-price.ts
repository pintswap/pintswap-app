import { useEffect, useState } from 'react';
import { getEthPrice, getUniswapToken } from '../api';
import { usePricesContext } from '../stores';
import { isAddress, getAddress, ZeroAddress } from 'ethers6';
import { DEFAULT_INTERVAL, getChainId, toAddress } from '../utils';
import { useQuery } from '@tanstack/react-query';

export const getUsdPrice = async (asset: string, eth: string, setState?: any) => {
    const address = !isAddress(asset) ? toAddress(asset) : getAddress(asset);
    if (address) {
        const _eth = eth && Number(eth) !== 0 ? eth : await getEthPrice();
        if (address === ZeroAddress) {
            setState && setState(_eth);
            return _eth;
        } else {
            const data = await getUniswapToken({ address });
            if (data) {
                let returnObj;
                if (data?.token?.derivedETH) {
                    returnObj =
                        Number(_eth) > 0 && data?.token?.derivedETH
                            ? (Number(_eth) * Number(data.token.derivedETH)).toString()
                            : address === ZeroAddress
                            ? ''
                            : '0';
                } else {
                    returnObj = data?.token?.lastPriceUSD;
                }
                setState && setState(returnObj);
                return returnObj;
            }
        }
    }
};

export const useUsdPrice = (asset?: string) => {
    const { eth } = usePricesContext();
    const chainId = getChainId();

    // TODO: Fix to work on all chains
    const { data } = useQuery({
        queryKey: ['use-usd-price', asset],
        queryFn: () => (asset ? getUsdPrice(asset, eth) : '0'),
        enabled: !!asset && chainId === 1,
        refetchInterval: DEFAULT_INTERVAL * 5, // Every 30 seconds
        initialData: '0',
    });

    return data || '0';
};
