import { Transition } from '@headlessui/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ActiveText, AnimatedHamburger, Avatar, DropdownMenu, Wallet } from '../components';
import { useWindowSize } from '../hooks/window-size';
import { useGlobalContext } from '../stores';

export const Navbar = () => {
    const { NAV_ITEMS } = useGlobalContext();
    const { width, breakpoints } = useWindowSize();
    const { address } = useAccount();
    const navigate = useNavigate();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const logoSize = width < 768 ? '36' : '52';

    return (
        <nav className="bg-neutral-900 shadow-md lg:shadow-lg py-2 lg:py-4 px-3 lg:px-6 w-full grid grid-cols-2 items-center z-50">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 lg:gap-3">
                <img src="/logo/ps-logo.png" alt="PintSwap Logo" height={logoSize} width={logoSize} />
                <span className="text-xl">
                    <span className="text-pink-500">{width >= breakpoints.sm ? 'Pint' : 'P'}</span>
                    <span className="text-sky-400">{width >= breakpoints.sm ? 'Swap' : 'S'}</span>
                </span>
            </button>
            <div className="flex items-center gap-2 justify-self-end">
                <Wallet />
                {width < breakpoints.md ? 
                    
                    <>
                    <button onClick={() => setIsMobileOpen(!isMobileOpen)}>
                        <AnimatedHamburger state={isMobileOpen} />
                    </button>
        
                    <Transition
                        show={isMobileOpen}
                        enter="transform transition ease-in-out duration-500"
                        enterFrom="-translate-y-[100vw]"
                        enterTo="translate-y-0"
                        leave="transform transition ease-in-out duration-500"
                        leaveFrom="translate-y-0"
                        leaveTo="-translate-y-[100vw]"
                        className="fixed -z-10 right-0 top-[54px]"
                    >
                        <ul className="flex flex-col w-screen bg-neutral-900 shadow-md z-1 p-2 items-start">
                            {NAV_ITEMS.map((item, i) => (
                                <li key={`nav-item-${i}`} className="w-full">
                                    <button 
                                    className="w-full -z-10 flex gap-2 items-center justify-end px-4 py-2" 
                                    onClick={() => { 
                                        navigate(`${item.route}`);
                                        setIsMobileOpen(false);
                                    }}>
                                        <ActiveText route={item.route || ''}>
                                        {item.text.toUpperCase()}
                                        </ActiveText>
                                        <ActiveText route={item.route || ''} className="text-indigo-500">
                  {item.icon}
                </ActiveText>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </Transition>

                    <Transition
                        show={isMobileOpen}
                        enter="transition-opacity ease-in-out duration-400"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity ease-in-out duration-400"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                        className="fixed top-0 left-0 w-screen h-screen -z-20"
                    >
                    <div
                        className="w-screen h-full bg-[rgba(0,0,0,0.25)] -z-10"
                        onClick={() => setIsMobileOpen(false)}
                    />
                    </Transition>
                </>
                 : 
                    address ? <Avatar type="clickable" size={width >= 1024 ? 42 : 32} /> : <></> 
                }
            </div>
        </nav>
    );
};
