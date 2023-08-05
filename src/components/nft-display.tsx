import { INFTProps } from '../utils/types';
import { TextDisplay } from './text-display';
import { toNumber, toBigInt } from 'ethers6';

type INFTDisplayProps = {
    nft: INFTProps | null;
    show?: 'full' | 'minimal' | 'img';
    loading?: boolean;
    height?: `h-${string}` | `max-h-${string}`;
    width?: `w-${string}` | `max-w-${string}`;
};

export const NFTDisplay = ({ nft, show, loading, height, width }: INFTDisplayProps) => {
    const _nft = nft as any;
    if (_nft?.imageBlob || _nft?.name || _nft?.description) {
        if (show === 'full') {
            return (
                <div className="flex flex-wrap gap-3">
                    <div>
                        {loading ? (
                            <div
                                className={`animate-pulse rounded-sm bg-neutral-700 ${
                                    height || ''
                                } ${width || 'w-full'}`}
                            />
                        ) : (
                            _nft?.imageBlob && (
                                <img
                                    src={URL.createObjectURL(_nft?.imageBlob)}
                                    alt={_nft.name}
                                    style={{
                                        backgroundColor: _nft?.background_color
                                            ? `#${_nft?.background_color}`
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
                        <TextDisplay label="Name" value={_nft?.name} />
                        <TextDisplay label="Description" value={_nft?.description} />
                        <TextDisplay label="ID" value={toNumber(_nft?.tokenId || toBigInt(0))} />
                        {_nft?.token && _nft?.amount && (
                            <TextDisplay label="Price" value={`${_nft?.amount} ${_nft?.token}`} />
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
                        _nft?.imageBlob && (
                            <img
                                src={URL.createObjectURL(_nft?.imageBlob)}
                                alt={_nft.name}
                                style={{
                                    backgroundColor: _nft?.background_color
                                        ? `#${_nft?.background_color}`
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
                        _nft?.imageBlob && (
                            <img
                                src={URL.createObjectURL(_nft?.imageBlob)}
                                alt={_nft.name}
                                style={{
                                    backgroundColor: _nft?.background_color
                                        ? `#${_nft?.background_color}`
                                        : undefined,
                                }}
                                loading="lazy"
                                className={`rounded-sm object-cover w-full ${height || ''} ${
                                    width || ''
                                }`}
                            />
                        )
                    )}
                    {_nft?.name && <h3 className="pt-2 pb-1">{_nft?.name}</h3>}
                    {_nft?.description && <small>{_nft?.description}</small>}
                </div>
            );
        }
    } else {
        return null;
    }
};
