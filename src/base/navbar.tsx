import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Avatar, DropdownMenu, Wallet } from '../components';
import { useWindowSize } from '../hooks/window-size';
import { useGlobalContext } from '../stores';

export const Navbar = () => {
    const { NAV_ITEMS } = useGlobalContext();
    const { width, breakpoints } = useWindowSize();
    const { address } = useAccount();
    const navigate = useNavigate();

    const logoSize = width < 768 ? '30' : '50'
    return (
        <nav className="py-2 lg:py-4 px-3 lg:px-6 w-full grid grid-cols-2 items-center">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 lg:gap-3">
                <img src="/logo/ps-logo.png" alt="PintSwap Logo" height={logoSize} width={logoSize} />
                <span className="text-xl md:text-2xl">
                    <span className="text-pink-500">{width >= breakpoints.sm ? 'Pint' : 'P'}</span>
                    <span className="text-sky-400">{width >= breakpoints.sm ? 'Swap' : 'S'}</span>
                </span>
            </button>
            <div className="flex items-center gap-2 justify-self-end">
                <Wallet />
                {width < breakpoints.md ? <DropdownMenu items={NAV_ITEMS} /> : address ? <Avatar type="clickable" size={width >= 1024 ? 42 : 32} /> : <></> }
            </div>
        </nav>
    );
};
