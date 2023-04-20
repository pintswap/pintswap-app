import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Avatar, DropdownMenu, Wallet } from '../components';
import { useWindowSize } from '../hooks/window-size';
import { useGlobalContext } from '../stores';

export const Navbar = () => {
    const { NAV_ITEMS } = useGlobalContext();
    const { width, breakpoint } = useWindowSize();
    const { address } = useAccount();
    const navigate = useNavigate();

    return (
        <nav className="py-2 lg:py-4 px-3 lg:px-6 w-full grid grid-cols-2 items-center">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 md:gap-4 lg:gap-6">
                <img src="/logo/ps-logo.png" alt="PintSwap Logo" height={width < 768 ? '50' : '60'} width={width < 768 ? '50' : '60'} />
                {width >= breakpoint && (
                    <span className="text-xl md:text-2xl">
                        <span className="text-pink-500">Pint</span>
                        <span className="text-sky-400">Swap</span>
                    </span>
                )}
            </button>
            <div className="flex items-center gap-2 justify-self-end">
                <Wallet />
                {width < breakpoint ? <DropdownMenu items={NAV_ITEMS} /> : address ? <Avatar type="clickable" size={width >= 1024 ? 42 : 32} /> : <></> }
            </div>
        </nav>
    );
};
