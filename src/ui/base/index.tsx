import { ReactNode } from 'react';
import { PageStatus } from '../components';
import { DashboardLayout } from './dashboard';
import { Navbar } from './navbar';
import { Transition } from '@headlessui/react';

type IBaseProps = {
    children: ReactNode;
    loading?: boolean;
};

export const Base = ({ children, loading }: IBaseProps) => {
    return (
        <>
            <Transition
                show={loading}
                enter="transition-opacity duration-200"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                className="relative !z-[99999]"
            >
                <PageStatus type="loading" />
            </Transition>
            <div className="flex flex-col h-screen">
                <Navbar />
                <DashboardLayout>{children}</DashboardLayout>
            </div>
        </>
    );
};
