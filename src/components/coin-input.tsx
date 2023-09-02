import { ChangeEventHandler, useState } from 'react';
import { SelectCoin } from './select-coin';

type ICoinInput = {
    label?: string;
    value?: string;
    onAmountChange: ChangeEventHandler<HTMLInputElement>;
    onAssetClick?: any;
    asset?: string;
};

export const CoinInput = ({ label, value, onAmountChange, onAssetClick, asset }: ICoinInput) => {
    const [open, setOpen] = useState(false);

    function clickAndClose(e: any) {
        onAssetClick(e);
        setOpen(false);
    }

    return (
        <div className="w-full bg-neutral-900 px-2 lg:px-3 pb-4 pt-1 rounded-lg shadow-inner shadow-black">
            {label && <span className="text-xs text-gray-400">{label}</span>}
            <div className="flex justify-between items-center gap-0.5">
                <input
                    className="py-3 text-2xl outline-none ring-0 bg-neutral-900 remove-arrow box-content min-w-0"
                    placeholder="0"
                    type="number"
                    onChange={onAmountChange}
                    value={value}
                />
                <SelectCoin
                    asset={asset}
                    onAssetClick={clickAndClose}
                    modalOpen={open}
                    setModalOpen={setOpen}
                />
            </div>
        </div>
    );
};
