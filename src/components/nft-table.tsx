import { CacheProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material/styles';
import ImageList from '@mui/material/ImageList';
import { useEffect, useState } from 'react';
import { muiCache, muiOptions, muiTheme } from '../utils/mui';
import ImageListItem from '@mui/material/ImageListItem';
import { SpinnerLoader } from './spinner-loader';
import { useWindowSize } from '../hooks/window-size';
import { useNavigate } from 'react-router-dom';
import { truncate } from '../utils/common';
import { fetchNFT, hashNftIdentifier } from '../utils/fetch-nft';

type INFTTableProps = {
    title?: string;
    data: (object | number[] | string[])[];
    loading?: boolean;
    peer?: string;
};

export const NFTTable = ({ data }: INFTTableProps) => {
    const { width, height } = useWindowSize();
    const [nfts, setNFTs] = useState([]);
    useEffect(() => {
        (async () => {
            setNFTs(
                (await Promise.all(data.map(async (v) => await fetchNFT((v as any).gives)))) as any,
            );
        })().catch((err) => console.error(err));
    }, [data]);
    return (
        <CacheProvider value={muiCache}>
            <ThemeProvider theme={muiTheme()}>
                <ImageList cols={ 3 } >
                    {nfts.map((v: any) => (
                        <ImageListItem key={hashNftIdentifier(v)}>
                            <div style={ { backgroundColor: '#050505', border: '3px solid #151515' } } ><img
                                src={URL.createObjectURL(v.imageBlob)}
                                alt={v.name}
                                style={{
                                    backgroundColor: v.background_color
                                        ? `#${v.background_color}`
                                        : undefined,
                                }}
                                loading="lazy"
                            /><div><h3>{ v.name }</h3></div><div><small>{ v.description }</small></div></div>
                        </ImageListItem>
                    ))}
                </ImageList>
            </ThemeProvider>
        </CacheProvider>
    );
};
