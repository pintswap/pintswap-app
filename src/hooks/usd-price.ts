import { useEffect, useState } from 'react';
import { getEthPrice, getUniswapToken, getDegenPrice } from '../api';
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
            try {
                const data = await fetch(
                    `https://api.dexscreener.com/latest/dex/tokens/${address}`,
                );

                const json = await data.json();
                if (data.status === 200 && json?.pairs?.length) {
                    const usdPrice = json.pairs[0].priceUsd;

                    setState && setState(usdPrice);
                    return usdPrice;
                } else {
                    const data = await getUniswapToken({ address });
                    console.timeLog('uniswap data', data);
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
            } catch (err) {
                console.log('#getUsdPrice: dexscreener', err);
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
    }
};

export const getUsdDegenPrice = async (asset: string, degen: string, setState?: any) => {
    const address = !isAddress(asset) ? toAddress(asset, 666666666) : getAddress(asset);

    if (address) {
        const _degen = degen && Number(degen) !== 0 ? degen : await getDegenPrice();
        if (address === ZeroAddress) {
            setState && setState(_degen);
            return _degen;
        } else {
            try {
                const data = await fetch(
                    `https://api.dexscreener.com/latest/dex/tokens/${address}`,
                );

                const json = await data.json();
                if (data.status === 200 && json?.pairs?.length) {
                    const usdPrice = json.pairs[0].priceUsd;

                    setState && setState(usdPrice);
                    return usdPrice;
                } else {
                    const data = await getUniswapToken({ address });
                    console.timeLog('uniswap data', data);
                    if (data) {
                        let returnObj;
                        if (data?.token?.derivedETH) {
                            returnObj =
                                Number(_degen) > 0 && data?.token?.derivedETH
                                    ? (Number(_degen) * Number(data.token.derivedETH)).toString()
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
            } catch (err) {
                console.log('#getUsdPrice: dexscreener', err);
                const data = await getUniswapToken({ address });
                if (data) {
                    let returnObj;
                    if (data?.token?.derivedETH) {
                        returnObj =
                            Number(_degen) > 0 && data?.token?.derivedETH
                                ? (Number(_degen) * Number(data.token.derivedETH)).toString()
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
    }
};

export const useUsdPrice = (asset?: string) => {
    const { eth, degen } = usePricesContext();
    const chainId = getChainId();

    // TODO: Fix to work on all chains
    if (chainId === 1) {
        const { isPending, isError, data, error } = useQuery({
            queryKey: ['use-usd-price', asset],
            queryFn: () => (asset ? getUsdPrice(asset, eth) : '0'),
            enabled: !!asset && !!chainId,
            refetchInterval: DEFAULT_INTERVAL * 5, // Every 30 seconds
            initialData: '0',
        });

        return data || '0';
    }
    if (chainId === 666666666) {
        const { isPending, isError, data, error } = useQuery({
            queryKey: ['use-usd-price-degen', asset],
            queryFn: () => (asset ? getUsdDegenPrice(asset, degen) : '0'),
            enabled: !!asset && !!chainId,
            refetchInterval: DEFAULT_INTERVAL * 5, // Every 30 seconds
            initialData: '0',
        });
        // const isAddy = isAddress("0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed")
        // const toAddy = toAddress(asset, 666666666)
        // console.log("is address", isAddy)
        // console.log("to address", toAddy)

        return data || '0';
    }
};
