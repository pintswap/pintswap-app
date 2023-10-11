import { useEffect, useMemo, useState } from 'react';
import { Card, DataTable, Header, Input } from '../components';
import { useOffersContext } from '../stores';
import { useSearch } from '../hooks';
import { IMarketProps } from '../utils';

const columns = [
    {
        name: 'quote',
        label: 'Ticker',
        options: {
            filter: false,
            sort: true,
            sortThirdClickReset: true,
        },
    },
    {
        name: 'buy',
        label: 'Buy',
        options: {
            filter: false,
            sort: true,
            sortThirdClickReset: true,
        },
    },
    {
        name: 'sell',
        label: 'Sell',
        options: {
            filter: false,
            sort: true,
            sortThirdClickReset: true,
        },
    },
    {
        name: 'market',
        label: 'Market',
        options: {
            filter: false,
            sort: true,
            sortThirdClickReset: true,
        },
    },
];

export const MarketsTableView = () => {
    const { offersByChain, isLoading } = useOffersContext();
    const [uniqueMarkets, setUniqueMarkets] = useState<IMarketProps[]>([]);
    const { query, list, handleChange } = useSearch(uniqueMarkets);

    useEffect(() => {
        if (offersByChain.erc20) {
            const _uniqueMarkets: IMarketProps[] = [];
            offersByChain.erc20.forEach((m) => {
                const found = _uniqueMarkets.find((u) => u.quote === m.ticker);
                const price = parseFloat(m.price);
                const sum = parseFloat(m.amount);
                const isAsk = m.type === 'ask';
                if (found) {
                    found.offers += 1;
                    if (isAsk) {
                        found.buy.offers += 1;
                        if (found.buy.best > price) found.buy.best = price;
                        if (found.buy.sum < sum) found.buy.sum = sum;
                    } else {
                        found.sell.offers += 1;
                        if (found.sell.best < price) found.sell.best = price;
                        if (found.sell.sum < sum) found.sell.sum = sum;
                    }
                } else {
                    if (isAsk) {
                        _uniqueMarkets.push({
                            // quote: quoteToken,
                            // bases: [split[1]],
                            quote: m.ticker,
                            bases: [],
                            buy: {
                                offers: 1,
                                sum: sum,
                                best: price,
                            },
                            sell: {
                                offers: 0,
                                sum: 0,
                                best: 0,
                            },
                            offers: 1,
                        });
                    } else {
                        _uniqueMarkets.push({
                            // quote: quoteToken,
                            // bases: [split[1]],
                            quote: m.ticker,
                            bases: [],
                            buy: {
                                offers: 0,
                                sum: 0,
                                best: 0,
                            },
                            sell: {
                                offers: 1,
                                sum: sum,
                                best: price,
                            },
                            offers: 1,
                        });
                    }
                }
            });
            console.log('unique markets', _uniqueMarkets);
            setUniqueMarkets(_uniqueMarkets);
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
            <Card>
                <DataTable
                    type="markets"
                    columns={columns}
                    data={list as IMarketProps[]}
                    loading={isLoading}
                    pagination
                />
            </Card>
        </div>
    );
};
