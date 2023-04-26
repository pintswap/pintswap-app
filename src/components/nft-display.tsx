import { INFTProps } from "../utils/common";
import { TextDisplay } from "./text-display";
import { toNumber } from 'ethers6';

type INFTDisplayProps = {
  nft: INFTProps;
  show?: 'full' | 'minimal';
  loading?: boolean;
  height?: `h-${string}` | `max-h-${string}`;
  width?: `w-${string}` | `max-w-${string}`;
}

export const NFTDisplay = ({ nft, show , loading, height, width}: INFTDisplayProps) => {
  console.log("nft", nft)
  if(show === 'full') {
    return (
      <div className="flex flex-wrap gap-3">
        <div>
          {loading ? (
              <div className={`animate-pulse bg-neutral-700 ${height || ''} ${width || 'w-full'}`} />
          ) : (
            <img
              src={URL.createObjectURL(nft.imageBlob)}
              alt={nft.name}
              style={{
                  backgroundColor: nft.background_color
                      ? `#${nft.background_color}`
                      : undefined,
              }}
              loading="lazy"
              className={`rounded-sm object-cover w-full ${height || ''} ${width || ''}`}
            />
          )}
        </div>
        <div className="flex flex-col gap-2 lg:gap-4">
          <TextDisplay label="Name" value={nft.name} />
          <TextDisplay label="Description" value={nft.description} />
          <TextDisplay label="ID" value={toNumber(nft.tokenId)} />
          {nft.token && nft.amount && (
            <TextDisplay label="Price" value={`${nft.amount} ${nft.token}`} />
          )}
        </div>
      </div>
    )
  } else {
    return (
      <div className="flex flex-col">
        <img
          src={URL.createObjectURL(nft.imageBlob)}
          alt={nft.name}
          style={{
              backgroundColor: nft.background_color
                  ? `#${nft.background_color}`
                  : undefined,
          }}
          loading="lazy"
          className={`rounded-sm object-cover w-full ${height || ''} ${width || ''}`}
        />
        <h3 className="pt-2 pb-1">{nft.name}</h3>
        <small>{nft.description}</small>
      </div>
    )
  }
}