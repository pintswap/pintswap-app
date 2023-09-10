import { useEffect, useState } from 'react';
import { tryBoth } from '../api';
import { usePricesContext } from '../stores';

const DEFAULT_RES = {
    data: null, // TODO
    isLoading: false,
    isError: false,
    error: false,
};

export const useSubgraph = (props: { address?: string; history?: 'day' | 'hour' }) => {
    const [res, setRes] = useState<any>(DEFAULT_RES);
    const { eth } = usePricesContext();

    function updateRes(key: 'data' | 'isLoading' | 'isError' | 'error', data: any) {
        setRes({ ...res, [key]: data });
    }

    useEffect(() => {
        (async () => {
            if (props && props.address) {
                updateRes('isLoading', true);
                const data = await tryBoth(props);
                if (data) {
                    setRes({
                        ...res,
                        data: {
                            ...data,
                            usdPrice:
                                Number(eth) > 0 && data?.token?.derivedETH
                                    ? (Number(eth) * Number(data.token.derivedETH)).toString()
                                    : '0',
                        },
                        isLoading: false,
                    });
                } else {
                    setRes({
                        ...res,
                        isLoading: false,
                        isError: true,
                    });
                }
            }
        })().catch((err) => console.error('#useSubgraph:', err));
    }, [props.address, props?.history]);

    return res;
};
