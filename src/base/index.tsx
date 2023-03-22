import { ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { Wallet } from '../components';
import { Footer } from './footer';
import { Navbar } from './navbar';

type IBaseProps = {
    children: ReactNode;
};

export const Base = ({ children }: IBaseProps) => {
    const { address } = useAccount();

    if (address) {
        return (
            <>
                <Navbar />
                <main className="flex justify-center">
                    <div className="max-w-4xl w-full px-4">{children}</div>
                </main>
                <Footer />
            </>
        );
    } else {
        return (
            <div className="flex h-screen w-full justify-center items-center flex-col gap-8">
                <div className="flex flex-col items-center gap-4">
                    <img src="/logo/logo-only.png" alt="PintSwap Logo" height="120" width="120" />
                    <h1 className="text-3xl">PintSwap</h1>
                    <h3>The most secure peer-to-peer token swap</h3>
                </div>
                <Wallet />
            </div>
        );
    }
};
