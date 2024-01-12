import { Switch } from '@headlessui/react';
import { Dispatch, SetStateAction } from 'react';
import { TooltipWrapper } from './tooltip';

type ISwitchToggle = {
    label?: string;
    state: boolean;
    setState: Dispatch<SetStateAction<boolean>> | any;
    labelOn: string;
    labelOff: string;
    disabled?: boolean;
    customColors?: string[];
    labelOnTooltip?: string;
    labelOffTooltip?: string;
};

export const SwitchToggle = ({
    label,
    state,
    setState,
    labelOn,
    labelOff,
    disabled,
    customColors,
    labelOnTooltip,
    labelOffTooltip,
}: ISwitchToggle) => {
    return (
        <div className="w-full flex flex-col gap-1">
            {label && <span className="text-sm">{label}</span>}
            <div className="flex items-center w-full">
                <Switch
                    checked={state}
                    onChange={setState}
                    disabled={disabled}
                    className={`bg-neutral-700 hover:outline hover:outline-1 hover:outline-neutral-700 w-full relative inline-flex items-center rounded transition-colors focus:ring-0`}
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
                    {labelOnTooltip ? (
                        <span
                            className={`inline-block transform rounded transition-transform w-1/2 py-2`}
                        >
                            <TooltipWrapper
                                text={labelOnTooltip}
                                id={`label-off-tooltip-${labelOn}`}
                                position="bottom"
                            >
                                {labelOn}
                            </TooltipWrapper>
                        </span>
                    ) : (
                        <span
                            className={`inline-block transform rounded transition-transform w-1/2 py-2`}
                        >
                            {labelOn}
                        </span>
                    )}

                    {labelOffTooltip ? (
                        <span
                            className={`inline-block transform rounded transition-transform w-1/2 py-2`}
                        >
                            <TooltipWrapper
                                text={labelOffTooltip}
                                id={`label-off-tooltip-${labelOff}`}
                                position="bottom"
                            >
                                {labelOff}
                            </TooltipWrapper>
                        </span>
                    ) : (
                        <span
                            className={`inline-block transform rounded transition-transform w-1/2 py-2`}
                        >
                            {labelOff}
                        </span>
                    )}
                </Switch>
            </div>
        </div>
    );
};
