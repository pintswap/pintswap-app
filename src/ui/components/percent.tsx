import { percentFormatter } from '../../utils';

type IPercent = {
    value: number | string | undefined;
    parentheses?: boolean;
};

export const Percent = ({ value, parentheses }: IPercent) => {
    function renderPercentColor() {
        if (value) {
            const _percent = Number(value);
            if (_percent > 0) {
                return 'text-green-400';
            } else if (_percent < 0) {
                return 'text-red-400';
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
                    {percentFormatter.format(Number(value || '0'))}
                </span>{' '}
                )
            </span>
        );
    }

    return (
        <span>
            <span className={renderPercentColor()}>
                {percentFormatter.format(Number(value || '0'))}
            </span>
        </span>
    );
};
