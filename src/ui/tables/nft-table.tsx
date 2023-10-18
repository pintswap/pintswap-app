import { CacheProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material/styles';
import ImageList from '@mui/material/ImageList';
import { useEffect, useState } from 'react';
import ImageListItem from '@mui/material/ImageListItem';
import { fetchNFT, hashNftIdentifier, muiCache, muiTheme } from '../../utils';
import { useNavigate } from 'react-router-dom';
import { NFTDisplay } from '../features';
import { Pagination, SpinnerLoader, Card } from '../components';
import { useWindowSize, usePagination } from '../../hooks';

type INFTTableProps = {
    title?: string;
    data: (object | number[] | string[])[];
    loading?: boolean;
    peer?: string;
    paginated?: boolean;
    perPage?: number;
};

export const NFTTable = ({
    data,
    loading,
    title,
    peer,
    paginated,
    perPage = 6,
}: INFTTableProps) => {
    const [nfts, setNFTs] = useState<any[]>([]);

    const navigate = useNavigate();
    const { width, breakpoints } = useWindowSize();
    const {
        renderData: renderPaginatedData,
        next,
        prev,
        jump,
        currentPage,
        maxPage,
    } = usePagination(nfts, perPage);

    const renderCols = () => {
        if (nfts.length === 0) return 1;
        else {
            if (width > breakpoints.lg) return 3;
            else if (width > breakpoints.sm) return 2;
            else return 1;
        }
    };

    const renderData = () => {
        if (paginated && nfts.length > perPage) {
            return renderPaginatedData();
        } else return nfts;
    };

    useEffect(() => {
        (async () => {
            setNFTs(await Promise.all(data.map(async (v: any) => await fetchNFT(v.gives, v.hash))));
        })().catch((err) => console.error(err));
    }, [data]);

    return (
        <CacheProvider value={muiCache}>
            <ThemeProvider theme={muiTheme()}>
                <ImageList cols={renderCols()} className="!gap-3">
                    {nfts.length > 0 ? (
                        renderData().map((nft: any, i) => {
                            const hash = nft?.hash ? nft?.hash : (data[i] as any)?.hash;
                            return (
                                <ImageListItem
                                    key={hashNftIdentifier(nft)}
                                    className="hover:cursor-pointer"
                                    onClick={() => navigate(`/fulfill/${peer}/nft/${hash}`)}
                                >
                                    <Card type="inner" className="hover:bg-neutral-800">
                                        <NFTDisplay nft={nft} height={'h-60'} />
                                    </Card>
                                </ImageListItem>
                            );
                        })
                    ) : loading ? (
                        <SpinnerLoader height="min-h-[100px]" />
                    ) : (
                        <div className="flex justify-center text-center w-full py-6">
                            <span className="">No NFT offers available</span>
                        </div>
                    )}
                </ImageList>

                {paginated && nfts.length > perPage && (
                    <Pagination
                        max={maxPage}
                        next={next}
                        prev={prev}
                        jump={jump}
                        perPage={perPage}
                        currentPage={currentPage}
                    />
                )}
            </ThemeProvider>
        </CacheProvider>
    );
};
