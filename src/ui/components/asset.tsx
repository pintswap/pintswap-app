import { getTokenList, toAddress } from '../../utils';
import { usePintswapContext } from '../../stores';
import { TooltipWrapper } from './tooltip';

type IAssetProps = {
    symbol?: string;
    size?: number;
    alt?: string;
    loading?: boolean;
    fontSize?: `text-${string}`;
    position?: 'left' | 'right';
    subSymbol?: string;
};

export const Asset = ({
    symbol,
    alt,
    loading,
    size = 25,
    fontSize = 'text-md',
    position = 'left',
    subSymbol,
}: IAssetProps) => {
    const {
        pintswap: { module, chainId },
    } = usePintswapContext();

    const assetProps = () => {
        const DEFAULT = {
            icon: '/img/generic.svg',
            alt: 'unknown token',
            symbol: 'Unknown',
            address: '',
        };
        const found = getTokenList(chainId).find(
            (token) => token?.symbol?.toLowerCase() === symbol?.toLowerCase().trim(),
        );
        if (found)
            return {
                icon: found?.logoURI || DEFAULT.icon,
                alt: alt || found?.symbol || DEFAULT.alt,
                symbol: found?.symbol || DEFAULT.symbol,
                address: found?.address || toAddress(found?.symbol),
            };
        const mainnetFound = getTokenList(1).find(
            (token) => token?.symbol?.toLowerCase() === symbol?.toLowerCase().trim(),
        );
        if (mainnetFound)
            return {
                icon: mainnetFound?.logoURI || DEFAULT.icon,
                alt: alt || mainnetFound?.symbol || DEFAULT.alt,
                symbol: mainnetFound?.symbol || DEFAULT.symbol,
                address: mainnetFound?.address || toAddress(mainnetFound?.symbol),
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
                    <TooltipWrapper
                        id={`${assetProps()?.symbol}-${chainId}`}
                        text={assetProps().address}
                        position="top"
                    >
                        <img
                            src={assetProps()?.icon}
                            alt={assetProps()?.alt || assetProps()?.symbol}
                            width={size}
                            height={size}
                            className="rounded-full contain"
                            style={{ contain: 'strict' }}
                        />
                    </TooltipWrapper>
                    <div className="flex flex-col">
                        <span className={`${fontSize} ${subSymbol ? 'leading-tight' : ''}`}>
                            {assetProps()?.symbol}
                        </span>
                        {subSymbol && <span className="text-xs text-gray-400">{subSymbol}</span>}
                    </div>
                </>
            )}
        </div>
    );
};
