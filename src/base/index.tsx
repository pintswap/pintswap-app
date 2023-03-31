import { ReactNode } from 'react';
import { ImSpinner9 } from 'react-icons/im';
import { MdChevronLeft } from 'react-icons/md';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Button, ProgressIndicator, Wallet } from '../components';
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
                    <div className="absolute z-50 h-screen w-screen top-0 left-0 bg-neutral-900">
                        <div className="flex flex-col justify-center items-center h-full gap-3">
                            <img src="/logo/logo-only.png" alt="PintSwap Logo" height="100" width="100" />
                            <span>Connecting to peer</span>
                            <ImSpinner9 className="animate-spin" size="24px" />
                        </div>
                    </div>
                )}
                <Navbar />
                <main className="flex justify-center">
                    <div className="max-w-4xl w-full p-4">
                        {pathname !== '/' && (
                            <Button
                                className="gap-1 mb-6"
                                type="transparent"
                                onClick={() => navigate('/')}
                            >
                                <MdChevronLeft />
                                Back
                            </Button>
                        )}
                        {children}
                    </div>
                </main>
                <Footer />
            </>
        );
    } else {
        return (
            <div className="flex h-screen w-full justify-center items-center flex-col gap-8">
                <div className="flex flex-col items-center gap-4">
                    <img src="/logo/logo-only.png" alt="PintSwap Logo" height="120" width="120" />
                    <h1 className="text-3xl">
                        <span className="text-pink-500">Pint</span>
                        <span className="text-sky-400">Swap</span>
                    </h1>
                    <h3>The most secure peer-to-peer token swap</h3>
                </div>
                <Wallet />
            </div>
        );
    }
};
