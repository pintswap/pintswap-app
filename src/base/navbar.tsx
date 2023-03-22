import { useAccount } from 'wagmi';
import { Wallet } from '../components';

export const Navbar = () => {
    const { address } = useAccount();
    return (
        <nav className="py-2 lg:py-4 px-3 lg:px-6 w-full grid grid-cols-3">
            <div></div>
            <div className="mx-auto">
                <img src="/logo/logo-only.png" alt="PintSwap Logo" height="60" width="60" />
            </div>
            <div className="justify-self-end">{address && <Wallet />}</div>
        </nav>
    );
};
