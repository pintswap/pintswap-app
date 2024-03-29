import { IOffer } from '@pintswap/sdk';
import { useSubgraph } from '../../hooks';
import { INFTProps } from '../../utils/types';
import { TextDisplay, SmartPrice } from '../components';
import { toNumber, toBigInt } from 'ethers6';

type INFTDisplayProps = {
    nft: INFTProps | null;
    show?: 'full' | 'minimal' | 'img';
    loading?: boolean;
    height?: `h-${string}` | `max-h-${string}`;
    width?: `w-${string}` | `max-w-${string}`;
    offer?: IOffer;
};

export const NFTDisplay = ({ nft, show, loading, height, width, offer }: INFTDisplayProps) => {
    if (show === 'full') {
        const foundErc20 = offer?.gives?.amount ? offer?.gives : offer?.gets;
        const tokenRes = useSubgraph({ address: foundErc20?.token });
        return (
            <div className="flex flex-wrap gap-3 lg:gap-4 xl:gap-5">
                <div>
                    {loading ? (
                        <div
                            className={`animate-pulse rounded-sm bg-neutral-700 ${height || ''} ${
                                width || 'w-full'
                            }`}
                        />
                    ) : (
                        nft?.imageBlob && (
                            <img
                                src={URL.createObjectURL(nft?.imageBlob)}
                                alt={nft.name}
                                style={{
                                    backgroundColor: nft?.background_color
                                        ? `#${nft?.background_color}`
                                        : undefined,
                                }}
                                loading="lazy"
                                className={`rounded-sm object-cover w-full ${height || ''} ${
                                    width || ''
                                }`}
                            />
                        )
                    )}
                </div>
                <div className="flex flex-col gap-2 lg:gap-4">
                    <TextDisplay label="Name" value={nft?.name || '-'} loading={loading} />
                    <TextDisplay
                        label="Description"
                        value={nft?.description || '-'}
                        loading={loading}
                    />
                    <TextDisplay
                        label="ID"
                        value={toNumber(nft?.tokenId || toBigInt(0))}
                        loading={loading}
                    />
                    {nft?.token && nft?.amount && (
                        <TextDisplay
                            loading={loading}
                            label="Price"
                            value={
                                <>
                                    <SmartPrice price={nft?.amount} />
                                    {` ${nft.token}`}
                                </>
                            }
                            usdValue={
                                loading
                                    ? undefined
                                    : Number(tokenRes?.data?.usdPrice || '0') > 0
                                    ? Number(tokenRes?.data?.usdPrice || '0') * Number(nft.amount)
                                    : undefined
                            }
                        />
                    )}
                </div>
            </div>
        );
    } else if (show === 'img') {
        return (
            <>
                {loading ? (
                    <div
                        className={`animate-pulse bg-neutral-700 ${height || ''} ${
                            width || 'w-full'
                        }`}
                    />
                ) : (
                    nft?.imageBlob && (
                        <img
                            src={URL.createObjectURL(nft?.imageBlob)}
                            alt={nft.name}
                            style={{
                                backgroundColor: nft?.background_color
                                    ? `#${nft?.background_color}`
                                    : undefined,
                            }}
                            loading="lazy"
                            className={`rounded-sm object-cover w-full ${height || ''} ${
                                width || ''
                            }`}
                        />
                    )
                )}
            </>
        );
    } else {
        return (
            <div className="flex flex-col">
                {loading ? (
                    <div
                        className={`animate-pulse bg-neutral-700 ${height || ''} ${
                            width || 'w-full'
                        }`}
                    />
                ) : (
                    nft?.imageBlob && (
                        <img
                            src={URL.createObjectURL(nft?.imageBlob)}
                            alt={nft.name}
                            style={{
                                backgroundColor: nft?.background_color
                                    ? `#${nft?.background_color}`
                                    : undefined,
                            }}
                            loading="lazy"
                            className={`rounded-sm object-cover w-full ${height || ''} ${
                                width || ''
                            }`}
                        />
                    )
                )}
                {nft?.name && <h3 className="pt-2 pb-1">{nft?.name}</h3>}
                {nft?.description && <small>{nft?.description}</small>}
            </div>
        );
    }
};
