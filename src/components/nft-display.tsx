import { IOffer } from '@pintswap/sdk';
import { useSubgraph } from '../hooks';
import { INFTProps } from '../utils/types';
import { SmartPrice } from './smart-price';
import { TextDisplay } from './text-display';
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
    console.log('nft', offer);
    if (nft?.imageBlob || nft?.name || nft?.description) {
        if (show === 'full') {
            const foundErc20 = offer?.gives?.amount ? offer?.gives : offer?.gets;
            const tokenRes = useSubgraph({ address: foundErc20?.token });
            console.log('tokenRes', tokenRes);
            return (
                <div className="flex flex-wrap gap-3 lg:gap-4 xl:gap-5">
                    <div>
                        {loading ? (
                            <div
                                className={`animate-pulse rounded-sm bg-neutral-700 ${
                                    height || ''
                                } ${width || 'w-full'}`}
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
                        <TextDisplay label="Name" value={nft?.name} />
                        <TextDisplay label="Description" value={nft?.description} />
                        <TextDisplay label="ID" value={toNumber(nft?.tokenId || toBigInt(0))} />
                        {nft?.token && nft?.amount && (
                            <TextDisplay
                                label="Price"
                                value={
                                    <>
                                        <SmartPrice price={nft?.amount} />
                                        {` ${nft.token}`}
                                    </>
                                }
                                usdValue={
                                    Number(tokenRes?.data?.usdPrice || '0') > 0
                                        ? Number(tokenRes.data.usdPrice) * Number(nft.amount)
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
    } else {
        return null;
    }
};
