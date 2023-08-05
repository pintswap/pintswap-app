import { useEffect, useState } from 'react';
import { ITokenProps, TOKENS } from '../utils';

type IAssetProps = {
    icon?: string;
    symbol?: string;
    size?: number;
    alt?: string;
    loading?: boolean;
};

export const Asset = ({ icon, symbol, alt, loading, size = 25 }: IAssetProps) => {
    const [assetData, setAssetData] = useState<any>({
        symbol: symbol || '',
        icon: icon || '',
        alt: alt || '',
    });

    useEffect(() => {
        const found = TOKENS.find(
            (token) => token?.symbol?.toLowerCase() === symbol?.toLowerCase().trim(),
        );
        if (found) setAssetData({ ...found, icon: found.logoURI, alt: alt || found.symbol });
        else setAssetData({ ...assetData, icon: '/img/generic.svg' });
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
                        src={assetData?.icon}
                        alt={assetData?.alt || assetData?.symbol}
                        width={size}
                        height={size}
                        className="rounded-full"
                    />
                    <span>{assetData?.symbol}</span>
                </>
            )}
        </div>
    );
};
