import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Button, Wallet } from '../components';
import { useWindowSize } from '../hooks/window-size';

export const Navbar = () => {
    const { width } = useWindowSize();
    const { address } = useAccount();
    const navigate = useNavigate();
    return (
        <nav className="py-2 lg:py-4 px-3 lg:px-6 w-full grid grid-cols-2 items-center">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 md:gap-4">
                    <img src="/logo/ps-logo.png" alt="PintSwap Logo" height={width < 768 ? '50' : '60'} width={width < 768 ? '50' : '60'} />
                    {width >= 768 && (
                        <span className="text-xl md:text-3xl">
                            <span className="text-pink-500">Pint</span>
                            <span className="text-sky-400">Swap</span>
                        </span>
                    )}
                </button>
            <div className="flex items-center gap-2 md:gap-4 justify-self-end">
                <Button type="transparent" onClick={() => navigate('/active')}>
                    {width < 768 ? 'All Offers' : 'Active Offers'}
                </Button>
                {address && <Wallet />}
            </div>
        </nav>
    );
};
