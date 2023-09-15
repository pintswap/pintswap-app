import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Asset, Button, Card, GradientBorder, Header, Input } from '../components';
import { useOffersContext, usePintswapContext } from '../stores';
import { getTokenLogo } from '../utils/token';
import { useSearch } from '../hooks';

export const PairsView = () => {
    const {
        pintswap: { chainId },
    } = usePintswapContext();
    const navigate = useNavigate();
    const { offersByChain, isLoading } = useOffersContext();
    const [uniquePairs, setUniquePairs] = useState<string[]>([]);
    const { query, list, handleChange } = useSearch(uniquePairs);

    const memoizedList = useMemo(() => list, [list]);

    useEffect(() => {
        if (offersByChain.erc20) {
            setUniquePairs(Array.from(new Set(offersByChain.erc20.map((o) => o.ticker))));
        }
    }, [offersByChain.erc20]);

    return (
        <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4 md:mb-6 gap-6">
                <Header breadcrumbs={[{ text: 'Markets', link: '/markets' }]}>Explore</Header>
                <Input
                    value={query}
                    onChange={handleChange}
                    type="search"
                    wrapperClass="max-w-[200px] sm:max-w-[250px] md:max-w-[300px] lg:max-w-[350px]"
                    noSpace
                />
            </div>
            <div
                className={
                    !isLoading && !memoizedList?.length
                        ? 'flex flex-col items-center justify-center w-full h-[50vh] gap-3'
                        : `grid grid-cols-1 gap-1 md:gap-1.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5`
                }
            >
                {!isLoading ? (
                    memoizedList?.length ? (
                        (memoizedList as string[]).map((pair) => {
                            const split = pair.split('/');
                            const token1 = split[0];
                            const token2 = split[1];
                            const icon1 = getTokenLogo(token1, chainId);
                            const icon2 = getTokenLogo(token2, chainId);
                            return (
                                <button
                                    key={`unique-pair-${pair}`}
                                    onClick={() =>
                                        navigate(
                                            `/markets/${token1.toLowerCase()}-${token2.toLowerCase()}`,
                                        )
                                    }
                                >
                                    <GradientBorder className="rounded-lg from-transparent to-transparent">
                                        <Card>
                                            <div
                                                className={`text-center flex items-center justify-center gap-3`}
                                            >
                                                <Asset icon={icon1} symbol={token1} size={20} />
                                                <span>/</span>
                                                <Asset icon={icon2} symbol={token2} size={20} />
                                            </div>
                                        </Card>
                                    </GradientBorder>
                                </button>
                            );
                        })
                    ) : (
                        <>
                            <span className="lg:text-lg">No available trades</span>
                            <Button onClick={() => navigate('/create')}>Create a trade</Button>
                        </>
                    )
                ) : (
                    [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <Card key={`loading-card-${i}`} className="justify-start">
                            <div className={`text-center flex items-center justify-center gap-3`}>
                                <Asset loading />
                                <span>/</span>
                                <Asset loading />
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};
