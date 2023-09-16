import { useEffect, useState } from 'react';
import { getTokenList, getSymbol, DEFAULT_CHAINID } from '../utils';
import { usePintswapContext } from '../stores';
import { getNetwork } from '@wagmi/core';

type IAssetProps = {
    icon?: string;
    symbol?: string;
    size?: number;
    alt?: string;
    loading?: boolean;
    fontSize?: 'text-sm' | 'text-md' | 'text-lg';
};

export const Asset = ({
    icon,
    symbol,
    alt,
    loading,
    size = 25,
    fontSize = 'text-md',
}: IAssetProps) => {
    const {
        pintswap: { module, chainId },
    } = usePintswapContext();
    const [assetData, setAssetData] = useState<any>({
        symbol: symbol || '',
        icon: icon || '',
        alt: alt || '',
    });

    useEffect(() => {
        (async () => {
            const found = getTokenList(chainId).find(
                (token) => token?.symbol?.toLowerCase() === symbol?.toLowerCase().trim(),
            );
            if (found) setAssetData({ ...found, icon: found.logoURI, alt: alt || found.symbol });
            else {
                setAssetData({
                    ...assetData,
                    icon: '/img/generic.svg',
                    symbol: await getSymbol(symbol || '', chainId),
                });
            }
        })().catch((err) => console.error(err));
    }, [symbol]);

    return (
        <div className={`flex items-center gap-2 ${loading ? 'animate-pulse' : ''}`}>
            {loading ? (
                <>
                    <div
                        className={`rounded-full self-center bg-neutral-800`}
                        style={{ minWidth: size, minHeight: size, maxHeight: size, maxWidth: size }}
                    />
                    <div
                        className={`rounded-md bg-neutral-800`}
                        style={{ width: 60, height: 20 }}
                    />
                </>
            ) : (
                <>
                    <img
                        src={assetData?.icon || '/img/generic.svg'}
                        alt={assetData?.alt || assetData?.symbol}
                        width={size}
                        height={size}
                        className="rounded-full"
                    />
                    <span className={fontSize}>{assetData?.symbol}</span>
                </>
            )}
        </div>
    );
};
