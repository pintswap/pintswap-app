import { ChangeEventHandler } from 'react';
import { SelectCoin } from './select-coin';

type ICoinInput = {
    label?: string;
    value: string;
    onChange: ChangeEventHandler<HTMLInputElement>;
    asset?: string;
};

export const CoinInput = ({ label, value, onChange, asset }: ICoinInput) => {
    return (
        <div className="w-full bg-neutral-800 px-2 lg:px-3 pb-4 pt-1 rounded-lg">
            {label && <span className="text-xs text-gray-400">{label}</span>}
            <div className="flex justify-between items-center gap-0.5">
                <input
                    className="py-3 text-2xl outline-none ring-0 bg-neutral-800 remove-arrow box-content min-w-0"
                    placeholder="0"
                    type="number"
                    onChange={onChange}
                    value={value}
                />
                {/* TODO */}
                <SelectCoin asset={asset} />
            </div>
        </div>
    );
};
