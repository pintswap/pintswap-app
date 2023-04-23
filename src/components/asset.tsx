type IAssetProps = {
  icon?: string;
  symbol?: string;
  size?: number;
  alt?: string;
  loading?: boolean;
}

export const Asset = ({ icon, symbol, alt, loading, size = 25 }: IAssetProps) => {
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
          <img src={icon} alt={alt || symbol} width={size} height={size} className="rounded-full" />
          <span>{symbol}</span>
        </>
      )}
    </div>
  )
}