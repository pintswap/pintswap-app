import { Asset, Button, Card, Header, Input, TextDisplay } from '../components';
import { useOffersContext } from '../../stores';
import { CoinInput } from '../features';
import { useStaking, useWindowSize } from '../../hooks';
import { numberFormatter, percentFormatter } from '../../utils';
import { MdInfo, MdInfoOutline } from 'react-icons/md';

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
    const {
        handleDeposit,
        handleWithdraw,
        handleInputChange,
        handleRedeem,
        depositInput,
        apr,
        availableToRedeem,
        totalAssets,
        totalSupply,
        userDeposited,
        previewDeposit,
        previewRedeem,
        previewWithdraw,
        isLoading,
    } = useStaking();

    return (
        <div className="flex flex-col max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-4 md:mb-6 gap-6">
                <div className="flex flex-col">
                    <Header>Staking</Header>
                    <div className="flex items-center gap-1.5 mt-1">
                        <div className="min-w-8">
                            <MdInfoOutline className="text-yellow-400" />
                        </div>
                        <span className="text-sm text-gray-400">
                            Vault rewards are currently unavailable until the trading engine is
                            fully integrated. Read more{' '}
                            <a
                                href="https://iron.pyrosec.gg/pintswap-litepaper.pdf"
                                target="_blank"
                                rel="noreferrer"
                                className="underline"
                            >
                                here in section 3 of the litepaper.
                            </a>
                        </span>
                    </div>
                </div>
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
                        <Asset size={32} symbol="PINT" subSymbol="sipPINT" fontSize="text-lg" />
                        <TextDisplay
                            label="APR"
                            value={percentFormatter.format(Number(apr))}
                            size="text-lg sm:text-xl"
                            align="right"
                        />
                        <TextDisplay
                            label={width < breakpoints.sm ? 'Staked' : 'Total Staked'}
                            value={numberFormatter.format(Number(totalAssets))}
                            size="text-lg sm:text-xl"
                            align="right"
                        />
                        <TextDisplay
                            label="Deposited"
                            value={numberFormatter.format(Number(userDeposited))}
                            size="text-lg sm:text-xl"
                            align="right"
                        />
                        <div className="col-span-4 sm:col-span-1 flex justify-end">
                            <Button
                                onClick={handleWithdraw}
                                type="outline-secondary"
                                checkNetwork
                                className="w-full sm:w-fit flex self-end justify-self-end"
                                disabled={
                                    isLoading || !userDeposited || Number(userDeposited) === 0
                                }
                            >
                                Withdraw All
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <CoinInput
                            onAmountChange={handleInputChange}
                            value={depositInput}
                            label="Stake"
                            asset="PINT"
                            customButton={
                                <Button disabled={isLoading} onClick={handleDeposit} checkNetwork>
                                    Deposit
                                </Button>
                            }
                            max
                        />
                        <CoinInput
                            onAmountChange={() => {}}
                            label="Total Rewards"
                            value={availableToRedeem}
                            asset="PINT"
                            customButton={
                                <Button onClick={handleRedeem} disabled type="outline" checkNetwork>
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
