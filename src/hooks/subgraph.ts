import { useEffect, useState } from 'react';
import { getUserHistory, tryBoth } from '../api';
import { usePintswapContext, usePricesContext } from '../stores';
import { useAccount } from 'wagmi';
import { ZeroAddress } from 'ethers6';

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
    const [res, setRes] = useState<IUserSubgraphRes>({ ...DEFAULT_RES, data: { usdPrice: eth } });

    function updateRes(key: 'data' | 'isLoading' | 'isError' | 'error', data: any) {
        setRes({ ...res, [key]: data });
    }

    useEffect(() => {
        (async () => {
            if (props && props?.address) {
                updateRes('isLoading', true);
                if (props.address === ZeroAddress) {
                    setRes({
                        ...res,
                        isLoading: false,
                        data: {
                            ...res.data,
                            usdPrice: eth,
                        },
                    });
                } else {
                    const data = await tryBoth(props);
                    if (data) {
                        setRes({
                            ...res,
                            data: {
                                ...data,
                                usdPrice:
                                    Number(eth) > 0 && data?.token?.derivedETH
                                        ? (Number(eth) * Number(data.token.derivedETH)).toString()
                                        : address === ZeroAddress
                                        ? ''
                                        : '0',
                            },
                            isLoading: false,
                        });
                    } else {
                        setRes({
                            ...res,
                            isLoading: false,
                            isError: true,
                            error: 'Something went wrong.',
                        });
                    }
                }
            }
        })().catch((err) => console.error('#useSubgraph:', err));
    }, [props?.address, props?.history, eth, address]);

    useEffect(() => {
        (async () => {
            if (address && module?.signer) {
                updateRes('isLoading', true);
                const userHistory = await getUserHistory(address, module.signer);
                let shallow = { ...res };
                if (shallow.data && userHistory?.length) shallow.data.userHistory = userHistory;
                shallow.isLoading = false;
                setRes(shallow);
            }
        })().catch((err) => console.error(err));
    }, [address, module?.signer]);

    return res;
};
