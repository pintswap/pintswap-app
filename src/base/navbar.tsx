import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Button, Wallet } from '../components';
import { useWindowSize } from '../hooks/window-size';

export const Navbar = () => {
    const { width } = useWindowSize();
    const { address } = useAccount();
    const navigate = useNavigate();
    return (
        <nav className="py-2 lg:py-4 px-3 lg:px-6 w-full grid grid-cols-2 items-center font-titillium font-bold">
            <div className="flex items-center gap-4 md:gap-6">
                <button onClick={() => navigate('/')}>
                    <img
                        src="/logo/ps-logo.png"
                        alt="PintSwap Logo"
                        height={width < 768 ? '50' : '60'}
                        width={width < 768 ? '50' : '60'}
                    />
                </button>
                <Button
                    className="tracking-wide"
                    type="transparent"
                    onClick={() => navigate('/active')}
                >
                    {width < 768 ? 'All Offers' : 'Active Offers'}
                </Button>
            </div>
            <div className="justify-self-end">{address && <Wallet />}</div>
        </nav>
    );
};
