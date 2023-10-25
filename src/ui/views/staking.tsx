import { Card, Header, Input } from '../components';
import { DataTable } from '../tables';
import { useOffersContext } from '../../stores';

const columns = [
    {
        name: 'asset',
        label: 'Asset',
        options: {
            filter: false,
            sort: true,
            sortThirdClickReset: true,
        },
    },
    {
        name: 'pending',
        label: 'Pending Rewards',
        options: {
            filter: false,
            sort: true,
            sortThirdClickReset: true,
        },
    },
    {
        name: 'walletStaked',
        label: 'Staked',
        options: {
            filter: false,
            sort: true,
            sortThirdClickReset: true,
        },
    },
    {
        name: 'apr',
        label: 'APR',
        options: {
            filter: false,
            sort: true,
            sortThirdClickReset: true,
        },
    },
    {
        name: 'totalStaked',
        label: 'Total Staked',
        options: {
            filter: false,
            sort: true,
            sortThirdClickReset: true,
        },
    },
    {
        name: '',
        label: '',
    },
];

const MOCK_DATA = [
    {
        asset: 'PINT',
        address: '0x0',
        pending: '0',
        walletStaked: '0',
        apr: '0',
        totalStaked: '100',
    },
];

export const StakingView = () => {
    const { uniqueMarkets, isLoading } = useOffersContext();

    return (
        <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4 md:mb-6 gap-6">
                <Header>Staking</Header>
                {/* <Input
                    value={query}
                    onChange={handleChange}
                    type="search"
                    wrapperClass="max-w-[200px] sm:max-w-[250px] md:max-w-[300px] lg:max-w-[350px]"
                    noSpace
                /> */}
            </div>
            <Card>
                <DataTable
                    type="staking"
                    columns={columns}
                    data={MOCK_DATA}
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
