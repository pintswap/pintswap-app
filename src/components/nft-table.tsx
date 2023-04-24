import { CacheProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material/styles';
import ImageList from '@mui/material/ImageList';
import { useEffect, useState } from 'react';
import { muiCache, muiTheme } from '../utils/mui';
import ImageListItem from '@mui/material/ImageListItem';
import { fetchNFT, hashNftIdentifier } from '../utils/fetch-nft';
import { useWindowSize } from '../hooks/window-size';
import { Card } from './card';
import { SpinnerLoader } from './spinner-loader';

type INFTTableProps = {
    title?: string;
    data: (object | number[] | string[])[];
    loading?: boolean;
    peer?: string;
};

export const NFTTable = ({ data, loading, title, peer }: INFTTableProps) => {
    const { width, breakpoints } = useWindowSize();
    const [nfts, setNFTs] = useState<any[]>([]);

    useEffect(() => {
        (async () => {
            setNFTs(
                (await Promise.all(data.map(async (v) => await fetchNFT((v as any).gives))))
            );
        })().catch((err) => console.error(err));
    }, [data]);

    return (
        <CacheProvider value={muiCache}>
            <ThemeProvider theme={muiTheme()}>
                <ImageList cols={nfts.length === 0 ? 1 : (width > breakpoints.lg ? 3 : 2)} gap={width > breakpoints.md ? 8 : 6 }>
                    {nfts.length > 0 ? nfts.map((v: any, i) => (
                        <a href={`#/fulfill/${peer}/${(data[i] as any).hash}`} key={hashNftIdentifier(v)}>
                            <ImageListItem>
                                <Card type="inner" className="hover:bg-gray-900">
                                    <img
                                        src={URL.createObjectURL(v.imageBlob)}
                                        alt={v.name}
                                        style={{
                                            backgroundColor: v.background_color
                                                ? `#${v.background_color}`
                                                : undefined,
                                        }}
                                        loading="lazy"
                                        className="rounded-sm"
                                    />
                                    <h3 className="pt-2 pb-1">{ v.name }</h3>
                                    <small>{ v.description }</small>
                                </Card>
                            </ImageListItem>
                        </a>
                    )) : loading ? (
                        <SpinnerLoader height="min-h-[100px]" />
                    ) : (
                        <div className="flex justify-center text-center w-full py-6">
                            <span className="">No NFT offers available</span>
                        </div>
                    )}
                </ImageList>
            </ThemeProvider>
        </CacheProvider>
    );
};
