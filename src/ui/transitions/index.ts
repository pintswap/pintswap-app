import { ReactNode } from 'react';

export type ITransition = {
    show: boolean;
    children: ReactNode;
    duration?: '150' | '300' | '500';
    className?: string;
};

export * from './fade-in';
