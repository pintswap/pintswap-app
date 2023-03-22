import { useAccount } from 'wagmi';
import { Wallet } from '../components';

export const Navbar = () => {
    const { address } = useAccount();
    return (
        <nav className="py-2 lg:py-4 px-3 lg:px-6 w-full grid grid-cols-2 lg:grid-cols-3 items-center">
            <div className="hidden lg:block"></div>
            <a className="lg:mx-auto" href="/">
                <img src="/logo/logo-only.png" alt="PintSwap Logo" height="60" width="60" />
            </a>
            <div className="justify-self-end">{address && <Wallet />}</div>
        </nav>
    );
};
