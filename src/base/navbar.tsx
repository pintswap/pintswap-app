import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Button, DropdownMenu, Wallet } from '../components';
import { useWindowSize } from '../hooks/window-size';
import { MdListAlt, MdOutlineAccountCircle } from 'react-icons/md'

const iconSize = '18px'

export const Navbar = () => {
    const { width } = useWindowSize();
    const { address } = useAccount();
    const navigate = useNavigate();

    const NAV_ITEMS = [
        { text: 'Open Orders', onClick: () => navigate('/active'), disabled: false, icon: <MdListAlt size={iconSize} /> },
        { text: 'Account', onClick: () => navigate('/account'), disabled: true, icon: <MdOutlineAccountCircle size={iconSize} /> }
    ]

    return (
        <nav className="py-2 lg:py-4 px-3 lg:px-6 w-full grid grid-cols-2 items-center">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 md:gap-4">
                <img src="/logo/ps-logo.png" alt="PintSwap Logo" height={width < 768 ? '50' : '60'} width={width < 768 ? '50' : '60'} />
                {width >= 768 && (
                    <span className="text-xl md:text-2xl">
                        <span className="text-pink-500">Pint</span>
                        <span className="text-sky-400">Swap</span>
                    </span>
                )}
            </button>
            <div className="flex items-center gap-2 md:gap-4 justify-self-end">
                {/* Desktop */}
                {width >= 768 && NAV_ITEMS.map((item, i) => (
                    <Button key={`nav-item-${i}`} type="transparent" onClick={item.onClick} disabled={item.disabled}>
                        {item.text}
                    </Button>
                ))}
                {address && <Wallet />}
                {/* Mobile */}
                {width < 768 && <DropdownMenu items={NAV_ITEMS} />}
            </div>
        </nav>
    );
};
