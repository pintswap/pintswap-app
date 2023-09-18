import { useEffect, useState } from 'react';
import { getTokenList, getSymbol, DEFAULT_CHAINID } from '../utils';
import { usePintswapContext } from '../stores';

type IAssetProps = {
    icon?: string;
    symbol?: string;
    size?: number;
    alt?: string;
    loading?: boolean;
    fontSize?: 'text-sm' | 'text-md' | 'text-lg';
    position?: 'left' | 'right';
};

export const Asset = ({
    icon,
    symbol,
    alt,
    loading,
    size = 25,
    fontSize = 'text-md',
    position = 'left',
}: IAssetProps) => {
    const {
        pintswap: { module, chainId },
    } = usePintswapContext();

    const determineAssetProps = () => {
        const DEFAULT = {
            icon: '/img/generic.svg',
            alt: 'unknown token',
            symbol: 'Unknown',
        };
        const found = getTokenList(chainId).find(
            (token) => token?.symbol?.toLowerCase() === symbol?.toLowerCase().trim(),
        );
        if (found)
            return {
                icon: found?.logoURI || '',
                alt: alt || found?.symbol || 'Unknown',
                symbol: found?.symbol || 'Unknown',
            };
        const mainnetFound = getTokenList().find(
            (token) => token?.symbol?.toLowerCase() === symbol?.toLowerCase().trim(),
        );
        if (mainnetFound)
            return {
                icon: mainnetFound?.logoURI || '',
                alt: alt || mainnetFound?.symbol || 'Unknown',
                symbol: mainnetFound?.symbol || 'Unknown',
            };
        return DEFAULT;
    };

    return (
        <div
            className={`flex items-center gap-1.5 sm: ${
                position === 'right' ? 'flex-row-reverse' : 'flex-row'
            } ${loading ? 'animate-pulse' : ''}`}
        >
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
                        src={determineAssetProps()?.icon || '/img/generic.svg'}
                        alt={determineAssetProps()?.alt || determineAssetProps()?.symbol}
                        width={size}
                        height={size}
                        className="rounded-full"
                    />
                    <span className={fontSize}>{determineAssetProps()?.symbol}</span>
                </>
            )}
        </div>
    );
};
