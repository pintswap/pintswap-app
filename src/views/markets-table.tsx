import { useEffect, useState } from 'react';
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
        name: 'low',
        label: 'Low',
        options: {
            filter: false,
            sort: true,
            sortThirdClickReset: true,
        },
    },
    {
        name: 'high',
        label: 'High',
        options: {
            filter: false,
            sort: true,
            sortThirdClickReset: true,
        },
    },
    {
        name: 'offers',
        label: 'Offers',
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
                // TODO: eth is currently broken so this is ugly
                // const split = m.ticker.split('/');
                // const quoteToken = split[0];
                // const found = uniqueMarkets.find((u) => u.quote === quoteToken);
                // const price = parseFloat(m.priceUsd);
                const found = _uniqueMarkets.find((u) => u.quote === m.ticker);
                const price = parseFloat(m.price);
                const isAsk = m.type === 'ask';
                if (found) {
                    // If base asset not included in 'bases' list
                    // TODO: reimplement once ETH is fixed
                    // if (!found.bases.includes(split[1])) found.bases.push(split[1]);
                    // Check for lower or higher price
                    if (found.high < price) found.high = price;
                    if (found.low > price) found.low = price;
                    // Sum liquidity
                    found.liquidity += price;
                    // Check if bid or ask exists
                    if (isAsk) found.asks += 1;
                    else found.bids += 1;
                    found.offers += 1;
                } else {
                    _uniqueMarkets.push({
                        // quote: quoteToken,
                        // bases: [split[1]],
                        quote: m.ticker,
                        bases: [],
                        low: price,
                        high: price,
                        liquidity: price,
                        bids: isAsk ? 0 : 1,
                        asks: isAsk ? 1 : 0,
                        offers: 1,
                    });
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
