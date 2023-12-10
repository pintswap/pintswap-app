import { getUserHistory, getUniswapToken } from '../api';
import { usePintswapContext, usePricesContext } from '../stores';
import { useAccount } from 'wagmi';
import { ZeroAddress } from 'ethers6';
import { useQuery } from '@tanstack/react-query';
import { IUserHistoryItemProps } from '../utils';

type IUserSubgraphRes = {
    data: {
        usdPrice?: string;
        token?: any;
        tokenDayDatas?: any[];
        tokenHourDatas?: any[];
        userHistory?: IUserHistoryItemProps[];
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
        queryFn: () => getUniswapToken(props),
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
                if (tokenDetails?.data?.token?.derivedETH) {
                    return Number(eth) > 0 && tokenDetails.data?.token?.derivedETH
                        ? (Number(eth) * Number(tokenDetails?.data.token?.derivedETH)).toString()
                        : address === ZeroAddress
                        ? ''
                        : '0';
                } else {
                    return tokenDetails?.data?.token?.lastPriceUSD || '0';
                }
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
