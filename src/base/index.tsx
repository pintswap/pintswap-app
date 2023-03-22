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

    return (
        <>
            <Navbar />
            <main>
                {!address ? (
                    <div className="flex h-[80vh] w-full justify-center items-center">
                        <Wallet />
                    </div>
                ) : (
                    children
                )}
            </main>
            <Footer />
        </>
    );
};
