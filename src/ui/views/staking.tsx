import { Asset, Button, Card, Header, TextDisplay } from '../components';
import { CoinInput } from '../features';
import { useStaking, useUsdPrice, useWindowSize } from '../../hooks';
import { numberFormatter, percentFormatter } from '../../utils';
import { MdInfoOutline } from 'react-icons/md';

export const StakingView = () => {
    const { width, breakpoints } = useWindowSize();
    const isMobile = width < breakpoints.sm;
    const {
        handleDeposit,
        handleInputChange,
        handleRedeem,
        depositInput,
        apr,
        availableToRedeem,
        totalAssets,
        userDeposited,
        isLoading,
        dataLoading,
        rewardsGenerated,
        userLoading,
    } = useStaking();
    const price = useUsdPrice('0x58fB30A61C218A3607e9273D52995a49fF2697Ee');

    return (
        <div className="flex flex-col max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-2.5 lg:mb-3 gap-6">
                <div className="flex flex-col">
                    <Header>Staking</Header>
                    <div className="flex items-center gap-1.5 mt-1">
                        <div className="min-w-8">
                            <MdInfoOutline className="text-yellow-400" />
                        </div>
                        <span className="text-sm text-gray-400">
                            Vault rewards are currently only accumalating token taxes until the
                            trading engine is fully integrated. Read more{' '}
                            <a
                                href="https://pintswap.exchange/litepaper.pdf"
                                target="_blank"
                                rel="noreferrer"
                                className="underline"
                            >
                                here in section 3 of the litepaper.
                            </a>{' '}
                        </span>
                    </div>
                </div>
            </div>
            <Card>
                <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-4 py-2 gap-y-3 gap-1 sm:gap-2 sm:px-2">
                        <Asset size={32} symbol="PINT" subSymbol="sipPINT" fontSize="text-lg" />
                        <TextDisplay
                            label="APR"
                            value={percentFormatter(isMobile ? 1 : 2).format(Number(apr))}
                            size="text-lg sm:text-xl"
                            align="right"
                            direction="vertical"
                            loading={dataLoading}
                        />
                        <TextDisplay
                            label={width < breakpoints.sm ? 'Staked' : 'Total Staked'}
                            value={numberFormatter(isMobile ? 1 : 3).format(Number(totalAssets))}
                            size="text-lg sm:text-xl"
                            align="right"
                            direction="vertical"
                            usdValue={numberFormatter(isMobile ? 1 : 3).format(
                                Number(price) * Number(totalAssets),
                            )}
                            loading={dataLoading}
                        />
                        <TextDisplay
                            label="Deposited"
                            value={numberFormatter(isMobile ? 1 : 3).format(Number(userDeposited))}
                            size="text-lg sm:text-xl"
                            align="right"
                            direction="vertical"
                            usdValue={numberFormatter().format(
                                Number(price) * Number(userDeposited),
                            )}
                            loading={dataLoading || userLoading}
                        />
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
                            label="Redeemable"
                            value={availableToRedeem}
                            asset="PINT"
                            change={rewardsGenerated}
                            customButton={
                                <Button
                                    onClick={handleRedeem}
                                    type="outline"
                                    disabled={Number(availableToRedeem) < 1 || isLoading}
                                    checkNetwork
                                >
                                    Withdraw All
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
