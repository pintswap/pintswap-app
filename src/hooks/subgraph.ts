import { useEffect, useState } from 'react';
import { getUserHistory, tryBoth } from '../api';
import { usePintswapContext, usePricesContext } from '../stores';
import { useAccount } from 'wagmi';
import { ZeroAddress } from 'ethers6';
import { useQuery } from '@tanstack/react-query';

type IUserSubgraphRes = {
    data: {
        usdPrice?: string;
        token?: any;
        tokenDayDatas?: any[];
        tokenHourDatas?: any[];
        userHistory?: any[];
    } | null;
    isLoading: boolean;
    isError: boolean;
    error: string;
};

const DEFAULT_RES: IUserSubgraphRes = {
    data: null, // TODO
    isLoading: false,
    isError: false,
    error: '',
};

export const useSubgraph = (props: { address?: string; history?: 'day' | 'hour' }) => {
    const {
        pintswap: { module },
    } = usePintswapContext();
    const { address } = useAccount();
    const { eth } = usePricesContext();

    const tokenDetails = useQuery({
        queryKey: ['use-subgraph-token', props.address],
        queryFn: () => tryBoth(props),
        enabled: !!props.address,
    });

    const userHistory = useQuery({
        queryKey: ['use-subgraph-user-history', address],
        queryFn: () => getUserHistory(address as string, module?.signer),
        enabled: !!module?.signer && !!address,
    });

    const renderUsdPrice = () => {
        if (props.address) {
            if (props.address === ZeroAddress) return eth;
            else {
                return Number(eth) > 0 && tokenDetails.data?.token?.derivedETH
                    ? (Number(eth) * Number(tokenDetails?.data.token.derivedETH)).toString()
                    : address === ZeroAddress
                    ? ''
                    : '0';
            }
        }
        return '0';
    };

    return {
        data: {
            usdPrice: renderUsdPrice(),
            userHistory: userHistory.data || [],
            ...tokenDetails.data,
        },
        isLoading: tokenDetails.isLoading || userHistory.isLoading,
        isError: tokenDetails.isError || userHistory.isError,
        error: tokenDetails.error || userHistory.error,
    };
};
