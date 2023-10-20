import { useEffect, useState } from 'react';
import { tryBoth } from '../api';
import { usePricesContext } from '../stores';
import { useAccount } from 'wagmi';
import { isAddress, getAddress, ZeroAddress } from 'ethers6';
import { toAddress } from '../utils';

export const getUsdPrice = async (asset: string, eth: string, setState?: any) => {
    const address = !isAddress(asset) ? toAddress(asset) : getAddress(asset);
    if (address) {
        if (address === ZeroAddress) {
            setState && setState(eth);
            return eth;
        } else {
            const data = await tryBoth({ address });
            if (data) {
                const returnObj =
                    Number(eth) > 0 && data?.token?.derivedETH
                        ? (Number(eth) * Number(data.token.derivedETH)).toString()
                        : address === ZeroAddress
                        ? ''
                        : '0';
                setState && setState(returnObj);
                return returnObj;
            }
        }
    }
};

export const useUsdPrice = (asset: string) => {
    const { address } = useAccount();
    const { eth } = usePricesContext();
    const [res, setRes] = useState('-');

    useEffect(() => {
        (async () => {
            await getUsdPrice(asset, eth, setRes);
        })().catch((err) => console.error('#useSubgraph:', err));
    }, [address, eth]);

    return res;
};
