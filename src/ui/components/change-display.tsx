import { percentFormatter } from '../../utils';
import { PiCaretUpFill, PiCaretDownFill } from 'react-icons/pi';

type IChangeDisplay = {
    value: number | string | undefined;
    parentheses?: boolean;
    percent?: boolean;
    opposite?: boolean;
    market?: 'buy' | 'sell';
    tax?: number;
    noCaret?: boolean;
};

export const ChangeDisplay = ({
    value,
    parentheses,
    percent,
    opposite,
    market,
    tax,
    noCaret,
}: IChangeDisplay) => {
    const isMoreThan = opposite ? Number(value) < 0 : Number(value) > 0;
    const iconSize = '12px';
    const renderValue = market ? Math.abs(Number(value || '0')) : Number(value || '0');

    function renderPercentColor() {
        if (value) {
            const _percent = Number(value);
            if (opposite ? _percent < 0 : _percent > 0) {
                let customClass = '';
                if (market) customClass = 'rounded-3xl bg-[rgba(74,222,128,0.1)] px-1';
                return `${customClass} text-green-400`;
            } else if (opposite ? _percent > 0 : _percent < 0) {
                let customClass = '';
                if (market) customClass = 'rounded-3xl bg-[rgba(248,113,113,0.1)] px-1';
                return `${customClass} text-red-400`;
            } else {
                return '';
            }
        }
        return '';
    }

    if (parentheses) {
        return (
            <span>
                ({' '}
                <span className={renderPercentColor()}>
                    {percent ? percentFormatter().format(Number(value || '0')) : value || '0'}
                </span>{' '}
                )
            </span>
        );
    }

    return (
        <div className="flex items-center gap-1">
            {tax ? (
                <span className={'rounded-3xl bg-[rgb(250,204,21,0.1)] px-1 text-yellow-400'}>
                    T
                </span>
            ) : null}
            <span className={`flex items-center ${renderPercentColor()}`}>
                {!noCaret && (
                    <>
                        {market === 'sell' || isMoreThan ? (
                            <PiCaretDownFill size={iconSize} />
                        ) : (
                            <PiCaretUpFill size={iconSize} />
                        )}
                    </>
                )}

                <span>{percent ? percentFormatter().format(renderValue) : renderValue}</span>
            </span>
        </div>
    );
};
