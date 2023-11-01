import { Card } from '../components';
import { DataTable } from '../tables';
import { useOffersContext, usePintswapContext } from '../../stores';

const columns = [
    {
        name: 'peer',
        label: 'Peer',
        options: {
            filter: false,
            sort: true,
            sortThirdClickReset: true,
        },
    },
    {
        name: 'hash',
        label: 'Hash',
        options: {
            filter: false,
        },
    },
    {
        name: 'ticker',
        label: 'Pair',
        options: {
            filter: true,
            sort: true,
            sortThirdClickReset: true,
        },
    },
    {
        name: 'type',
        label: 'Type',
        options: {
            filter: true,
            sort: true,
            sortThirdClickReset: true,
        },
    },
    {
        name: 'amount',
        label: 'Amount',
        options: {
            filter: false,
            sort: true,
            sortThirdClickReset: true,
        },
    },
    {
        name: 'price',
        label: 'Price',
        options: {
            filter: false,
            sort: true,
            sortThirdClickReset: true,
        },
    },
];

/**
 * @deprecated
 * Markets table is used as current home page instead
 */
export const ExploreView = () => {
    const { offersByChain } = useOffersContext();
    const {
        pintswap: { loading },
    } = usePintswapContext();

    return (
        <div className="flex flex-col">
            <h2 className="view-header">Explore</h2>
            <Card>
                <DataTable
                    title="Open Orders"
                    columns={columns}
                    data={offersByChain.erc20}
                    loading={loading}
                    type="explore"
                />
            </Card>
        </div>
    );
};
