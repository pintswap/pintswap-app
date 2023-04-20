import { ReactNode } from 'react';
import { FullPageStatus } from '../components';
import { DashboardLayout } from './dashboard';
import { Navbar } from './navbar';

type IBaseProps = {
    children: ReactNode;
    loading?: boolean;
};

export const Base = ({ children, loading }: IBaseProps) => {
    return (
        <>
            {loading && <FullPageStatus type="loading" />}
            <Navbar />
            <DashboardLayout>
                {children}
            </DashboardLayout>
        </>
    );
};
