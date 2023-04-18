import { ReactNode } from 'react';
import { MdChevronLeft } from 'react-icons/md';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Button, FullPageStatus, Wallet } from '../components';
import { DashboardLayout } from './dashboard';
import { Footer } from './footer';
import { Navbar } from './navbar';

type IBaseProps = {
    children: ReactNode;
    loading?: boolean;
};

export const Base = ({ children, loading }: IBaseProps) => {
    const { address } = useAccount();
    const { pathname } = useLocation();
    const navigate = useNavigate();

    if (address) {
        return (
            <>
                {loading && (
                    <FullPageStatus type="loading" />
                )}
                <Navbar />
                {/* <main className="flex justify-center">
                    <div className="max-w-4xl w-full p-4">
                        {pathname !== '/' && (
                            <Button
                                className="gap-1 mb-6"
                                type="transparent"
                                onClick={() => navigate(-1)}
                            >
                                <MdChevronLeft />
                                Back
                            </Button>
                        )}
                        {children}
                    </div>
                </main> */}
                <DashboardLayout>
                    {children}
                </DashboardLayout>
                <Footer />
            </>
        );
    } else {
        return (
            <div className="flex h-screen w-full justify-center items-center flex-col gap-8">
                <div className="flex flex-col items-center gap-4">
                    <img src="/logo/ps-logo.png" alt="PintSwap Logo" height="120" width="120" />
                    <h1 className="text-3xl">
                        <span className="text-pink-500">Pint</span>
                        <span className="text-sky-400">Swap</span>
                    </h1>
                    <h3 className="text-center">The most secure<br /> peer-to-peer token swap</h3>
                </div>
                <Wallet />
            </div>
        );
    }
};
