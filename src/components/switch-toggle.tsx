import { Switch } from '@headlessui/react';
import { Dispatch, SetStateAction } from 'react';

type ISwitchToggle = {
    label?: string;
    state: boolean;
    setState: Dispatch<SetStateAction<boolean>> | any;
    labelOn: string;
    labelOff: string;
    disabled?: boolean;
    customColors?: string[];
};

export const SwitchToggle = ({
    label,
    state,
    setState,
    labelOn,
    labelOff,
    disabled,
    customColors,
}: ISwitchToggle) => {
    return (
        <div className="w-full flex flex-col gap-1">
            {label && <span className="text-sm">{label}</span>}
            <div className="flex items-center w-full">
                <Switch
                    checked={state}
                    onChange={setState}
                    disabled={disabled}
                    className={` bg-neutral-600 w-full relative inline-flex items-center rounded transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:ring-offset-1`}
                >
                    <span
                        className={`${
                            state
                                ? `translate-x-[calc(100%-2px)] ${
                                      customColors
                                          ? customColors[0]
                                          : 'bg-gradient-to-tr to-red-700 from-rose-400'
                                  }`
                                : `translate-x-0.5 ${
                                      customColors
                                          ? customColors[1]
                                          : 'bg-gradient-to-tr to-green-700 from-emerald-400'
                                  }`
                        } absolute inline-block transform rounded transition-transform w-1/2 py-[18px]`}
                    />
                    <span
                        className={`inline-block transform rounded transition-transform w-1/2 py-2`}
                    >
                        {labelOn}
                    </span>
                    <span
                        className={`inline-block transform rounded transition-transform w-1/2 py-2 bg-transparent`}
                    >
                        {labelOff}
                    </span>
                </Switch>
            </div>
        </div>
    );
};
