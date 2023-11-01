import { percentFormatter } from '../../utils';

type IChangeDisplay = {
    value: number | string | undefined;
    parentheses?: boolean;
    percent?: boolean;
};

export const ChangeDisplay = ({ value, parentheses, percent }: IChangeDisplay) => {
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
                    {percent ? percentFormatter.format(Number(value || '0')) : value || '0'}
                </span>{' '}
                )
            </span>
        );
    }

    return (
        <span>
            <span className={renderPercentColor()}>
                {percent ? percentFormatter.format(Number(value || '0')) : value || '0'}
            </span>
        </span>
    );
};
