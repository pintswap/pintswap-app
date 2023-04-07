import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Wallet } from '../components';

export const Navbar = () => {
    const { address } = useAccount();
    const navigate = useNavigate();
    return (
        <nav className="py-2 lg:py-4 px-3 lg:px-6 w-full grid grid-cols-2 md:grid-cols-3 items-center">
            <div className="hidden md:block"></div>
            <button className="md:mx-auto" onClick={() => navigate('/')}>
                <img src="/logo/ps-logo.png" alt="PintSwap Logo" height="60" width="60" />
            </button>
            <div className="justify-self-end">{address && <Wallet />}</div>
        </nav>
    );
};
