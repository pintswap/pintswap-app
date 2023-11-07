import { Card, Header, Input } from '../components';
import { DataTable } from '../tables';
import { useOffersContext } from '../../stores';
import { useSearch } from '../../hooks';
import { IMarketProps } from '../../utils';

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
            sort: false,
            sortThirdClickReset: true,
            setCellHeaderProps: () => ({ align: 'center' }),
            setCellProps: () => ({ align: 'right' }),
        },
    },
    {
        name: 'sell',
        label: 'Sell',
        options: {
            filter: false,
            sort: false,
            sortThirdClickReset: true,
            setCellHeaderProps: () => ({ align: 'center' }),
            setCellProps: () => ({ align: 'right' }),
        },
    },
    {
        name: 'market',
        label: 'Market',
        options: {
            filter: false,
            sort: false,
            sortThirdClickReset: true,
            setCellHeaderProps: () => ({ align: 'right' }),
            setCellProps: () => ({ align: 'right' }),
        },
    },
];

export const MarketsTableView = () => {
    const { uniqueMarkets, isLoading } = useOffersContext();
    const { query, list, handleChange } = useSearch(uniqueMarkets);

    return (
        <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4 gap-6">
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
                    options={{
                        sortOrder: {
                            name: 'quote',
                            direction: 'asc',
                        },
                    }}
                />
            </Card>
        </div>
    );
};
