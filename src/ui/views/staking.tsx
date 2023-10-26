import { Asset, Button, Card, Header, Input, TextDisplay } from '../components';
import { useOffersContext } from '../../stores';
import { CoinInput } from '../features';
import { useWindowSize } from '../../hooks';

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
    const { width, breakpoints } = useWindowSize();

    return (
        <div className="flex flex-col max-w-5xl mx-auto">
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
                <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-4 sm:grid-cols-5 py-2 gap-y-3 sm:gap-2">
                        <Asset size={32} symbol="PINT" fontSize="text-lg" />
                        <TextDisplay
                            label="APR"
                            value="7.36%"
                            size="text-lg sm:text-xl"
                            align="right"
                        />
                        <TextDisplay
                            label={width < breakpoints.sm ? 'Staked' : 'Total Staked'}
                            value="$13M"
                            size="text-lg sm:text-xl"
                            align="right"
                        />
                        <TextDisplay
                            label="Deposited"
                            value="$100"
                            size="text-lg sm:text-xl"
                            align="right"
                        />
                        <div className="col-span-4 sm:col-span-1 flex justify-end">
                            <Button
                                type="outline-secondary"
                                checkNetwork
                                className="w-full sm:w-fit flex self-end justify-self-end"
                            >
                                Withdraw All
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <CoinInput
                            onAmountChange={() => {}}
                            label="Stake"
                            asset="PINT"
                            customButton={<Button checkNetwork>Deposit</Button>}
                        />
                        <CoinInput
                            onAmountChange={() => {}}
                            label="Total Rewards"
                            asset="PINT"
                            customButton={
                                <Button type="outline" checkNetwork>
                                    Redeem
                                </Button>
                            }
                            disabled
                        />
                    </div>
                </div>
            </Card>
        </div>
    );
};
