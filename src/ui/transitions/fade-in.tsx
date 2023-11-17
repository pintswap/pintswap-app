import { Transition } from '@headlessui/react';
import { ITransition } from '.';

export const FadeIn = ({ show, children, duration, className }: ITransition) => {
    const durationClass = () => {
        switch (duration) {
            case '500':
                return 'duration-500';
            case '300':
                return 'duration-300';
            default:
                return 'duration-150';
        }
    };
    return (
        <Transition
            show={show}
            enter={`transition-opacity ${durationClass()}`}
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave={`transition-opacity ${durationClass()}`}
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            className={className}
        >
            {children}
        </Transition>
    );
};
