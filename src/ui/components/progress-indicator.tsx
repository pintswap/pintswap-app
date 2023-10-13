import { classNames } from '../../utils/format';
import { MdCheck } from 'react-icons/md';

export type IOrderProgressProps = {
    name: string;
    status: 'complete' | 'current' | 'upcoming';
    orderHash?: string;
};

export type IProgressIndicatorProps = {
    steps: IOrderProgressProps[];
};

export const DEFAULT_PROGRESS: IOrderProgressProps[] = [
    {
        name: 'Create',
        status: 'current',
    },
    {
        name: 'Fulfill',
        status: 'upcoming',
    },
    {
        name: 'Complete',
        status: 'upcoming',
    },
];

export const ProgressIndicator = ({ steps }: IProgressIndicatorProps) => (
    <ol role="list" className="flex items-center">
        {steps &&
            steps.map((step, stepIdx) => (
                <li
                    key={step.name}
                    className={classNames(
                        stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : '',
                        'relative',
                        'flex flex-col items-center justify-center',
                    )}
                >
                    {step.status === 'complete' ? (
                        <>
                            <div
                                className={`absolute inset-0 flex items-center -translate-y-2.5 ${
                                    step.name === 'Complete' ? 'w-[42px]' : 'translate-x-5'
                                }`}
                                aria-hidden="true"
                            >
                                <div className="h-0.5 w-full bg-primary" />
                            </div>
                            <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary-dark">
                                <MdCheck className="h-5 w-5 text-white" aria-hidden="true" />
                                <span className="sr-only">{step.name}</span>
                            </span>
                        </>
                    ) : step.status === 'current' ? (
                        <>
                            <div
                                className={`absolute inset-0 flex items-center -translate-y-2.5 ${
                                    step.name === 'Complete' ? 'w-0' : 'translate-x-5'
                                }`}
                                aria-hidden="true"
                            >
                                <div className="h-0.5 w-full bg-gray-200" />
                            </div>
                            <span
                                className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary-dark bg-white"
                                aria-current="step"
                            >
                                <span
                                    className="h-2.5 w-2.5 rounded-full bg-primary-dark animate-ping-slow"
                                    aria-hidden="true"
                                />
                                <span className="sr-only">{step.name}</span>
                            </span>
                        </>
                    ) : (
                        <>
                            <div
                                className={`absolute inset-0 flex items-center -translate-y-2.5 ${
                                    step.name === 'Complete' ? 'w-[42px]' : 'translate-x-5'
                                }`}
                                aria-hidden="true"
                            >
                                <div className="h-0.5 w-full bg-gray-200" />
                            </div>
                            <span className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white">
                                <span
                                    className="h-2.5 w-2.5 rounded-full bg-transparent"
                                    aria-hidden="true"
                                />
                                <span className="sr-only">{step.name}</span>
                            </span>
                        </>
                    )}
                    <div className="">
                        <span className="text-xs">{step.name}</span>
                    </div>
                </li>
            ))}
    </ol>
);
