import { MdArrowDownward, MdSettings } from 'react-icons/md';
import { Card } from './card';
import { TooltipWrapper } from './tooltip';
import { CoinInput } from './coin-input';
import { IOffer } from '@pintswap/sdk';
import { TxDetails } from './tx-details';
import { Button } from './button';
import { MouseEventHandler } from 'react';
import { StatusIndicator } from './status-indicator';

type ISwapModule = {
    trade: IOffer;
    loading?: {
        trade?: boolean;
        broadcast?: boolean;
        fulfill?: boolean;
    };
    onClick?: MouseEventHandler<HTMLButtonElement>;
    updateTrade?: (key: string | any, val: string) => void;
    disabled?: boolean;
    type?: 'swap' | 'fulfill';
    header?: string;
    otc?: boolean;
    toggleOtc?: () => void;
};

export const SwapModule = ({
    header,
    trade,
    loading,
    updateTrade,
    onClick,
    disabled,
    type = 'swap',
    otc,
    toggleOtc,
}: ISwapModule) => {
    const determineLoadingText = () => {
        if (loading?.broadcast || loading?.fulfill) return 'Swapping';
        if (loading?.trade) return 'Loading Offer';
        return 'Loading';
    };
    const determineButtonText = () => {
        if (type === 'fulfill') return 'Fulfill';
        return 'Swap';
    };

    return (
        <Card className="!py-4">
            <div className="flex items-center justify-between mb-2 md:mb-3 lg:mb-4 px-0.5">
                <span className="text-xl">
                    {header && type !== 'swap'
                        ? header
                        : otc !== undefined && (
                              <button
                                  onClick={toggleOtc}
                                  className="py-1 pl-0.5 pr-2 transition duration-150 hover:text-neutral-300"
                              >
                                  <StatusIndicator
                                      active={!otc}
                                      message={!otc ? 'Public Orderbook' : 'Share via OTC'}
                                      customColors={[
                                          'bg-gradient-to-tr to-sky-300 from-indigo-600',
                                      ]}
                                  />
                              </button>
                          )}
                </span>
                {/* <TooltipWrapper text="Working on it" id="working-on-it-swap-settings">
                    <button className="pl-2 py-0.5 hover:text-neutral-300 transition duration-100">
                        <MdSettings size={20} />
                    </button>
                </TooltipWrapper> */}
            </div>

            <div className="flex flex-col justify-center items-center gap-1.5">
                <CoinInput
                    label="You give"
                    value={trade.gives.amount}
                    onAssetClick={(e: any) =>
                        updateTrade ? updateTrade('gives.token', e.target.innerText) : {}
                    }
                    onAmountChange={({ currentTarget }) =>
                        updateTrade ? updateTrade('gives.amount', currentTarget.value) : {}
                    }
                    asset={trade.gives.token}
                    max={type === 'swap'}
                    disabled={type === 'fulfill'}
                    type={type}
                    id="swap-module-give"
                />

                <button className="absolute p-1.5 bg-brand-dashboard rounded-lg">
                    <div className="bg-neutral-800 p-1 rounded-md">
                        <MdArrowDownward />
                    </div>
                </button>
                <CoinInput
                    label="You get"
                    value={trade.gets.amount || ''}
                    onAssetClick={(e: any) =>
                        updateTrade ? updateTrade('gets.token', e.target.innerText) : {}
                    }
                    onAmountChange={({ currentTarget }) =>
                        updateTrade ? updateTrade('gets.amount', currentTarget.value) : {}
                    }
                    asset={trade.gets.token}
                    disabled={type === 'fulfill'}
                    type={type}
                    id="swap-module-get"
                />
            </div>

            <div className="flex flex-col gap-2 mt-2">
                <TxDetails
                    trade={trade}
                    loading={typeof loading === 'boolean' ? loading : loading?.trade}
                    type="fulfill"
                />
                <Button
                    className="w-full rounded-lg !py-3"
                    disabled={disabled}
                    loadingText={determineLoadingText()}
                    loading={loading?.broadcast || loading?.fulfill || loading?.trade}
                    onClick={onClick}
                    checkNetwork
                    form="submit"
                >
                    {determineButtonText()}
                </Button>
            </div>
        </Card>
    );
};
