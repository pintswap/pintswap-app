import { ReactNode } from 'react';
import { PageStatus } from '../components';
import { DashboardLayout } from './dashboard';
import { Navbar } from './navbar';

type IBaseProps = {
    children: ReactNode;
    loading?: boolean;
};

export const Base = ({ children, loading }: IBaseProps) => {
    return (
        <>
            {loading && <PageStatus type="loading" />}
            <div className="flex flex-col h-screen">
                <Navbar />
                <DashboardLayout>{children}</DashboardLayout>
            </div>
        </>
    );
};
