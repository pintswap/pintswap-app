import { useEffect, useState } from 'react';
import { tryBoth } from '../api';

const DEFAULT_RES = {
    data: null, // TODO
    isLoading: false,
    isError: false,
    error: false,
};

export const useSubgraph = (props: { address: string; history?: 'day' | 'hour' }) => {
    const [res, setRes] = useState<any>(DEFAULT_RES);

    function updateRes(key: 'data' | 'isLoading' | 'isError' | 'error', data: any) {
        setRes({ ...res, [key]: data });
    }

    useEffect(() => {
        (async () => {
            if (props.address) {
                updateRes('isLoading', true);
                const data = await tryBoth(props);
                console.log('trying both', data);
                if (data) {
                    setRes({
                        ...res,
                        data: data as any,
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
