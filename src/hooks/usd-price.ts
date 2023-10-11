import { useEffect, useState } from 'react';
import { tryBoth } from '../api';
import { usePricesContext } from '../stores';
import { useAccount } from 'wagmi';
import { isAddress, getAddress, ZeroAddress } from 'ethers6';
import { toAddress } from '../utils';

export const useUsdPrice = (asset: string) => {
    const { address } = useAccount();
    const { eth } = usePricesContext();
    const [res, setRes] = useState('-');

    useEffect(() => {
        (async () => {
            const address = !isAddress(asset) ? toAddress(asset) : getAddress(asset);
            if (address) {
                if (address === ZeroAddress) {
                    setRes(eth);
                } else {
                    const data = await tryBoth({ address });
                    if (data) {
                        setRes(
                            Number(eth) > 0 && data?.token?.derivedETH
                                ? (Number(eth) * Number(data.token.derivedETH)).toString()
                                : address === ZeroAddress
                                ? ''
                                : '0',
                        );
                    }
                }
            }
        })().catch((err) => console.error('#useSubgraph:', err));
    }, [address, eth]);

    return res;
};
