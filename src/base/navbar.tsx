import { Transition } from '@headlessui/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ActiveText, AnimatedHamburger, Avatar, Wallet } from '../components';
import { useDashNav, useWindowSize } from '../hooks';
import { usePintswapContext } from '../stores';

export const Navbar = () => {
    const { NAV_ITEMS } = useDashNav();
    const { width, breakpoints } = useWindowSize();
    const { address } = useAccount();
    const { pintswap } = usePintswapContext();
    const navigate = useNavigate();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const logoSize = width < 768 ? '180' : '200';

    return (
        <>
            <nav
                className={`bg-brand-dashboard py-2.5 lg:py-3 px-2 md:px-3 lg:px-6 w-full z-50 relative`}
            >
                <div className="3xl:max-w-8xl mx-auto grid grid-cols-2 items-center">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 lg:gap-3"
                    >
                        <img
                            src="/logo/ps-logo-drip.png"
                            alt="PintSwap Logo"
                            height={logoSize}
                            width={logoSize}
                        />
                        {/* <span className="text-2xl">
                            <span className="text-pink-500">
                                {width >= breakpoints.sm ? 'Pint' : 'P'}
                            </span>
                            <span className="text-sky-400">
                                {width >= breakpoints.sm ? 'Swap' : 'S'}
                            </span>
                        </span> */}
                    </button>
                    <div className={`flex items-center gap-2 justify-self-end bg-brand-dashboard`}>
                        <Wallet />
                        {width < breakpoints.md ? (
                            <button
                                onClick={() => setIsMobileOpen(!isMobileOpen)}
                                className="px-0.5"
                            >
                                <AnimatedHamburger state={isMobileOpen} />
                            </button>
                        ) : address ? (
                            <Avatar
                                type="clickable"
                                size={width >= 1024 ? 42 : 32}
                                showActive
                                peer={pintswap?.module?.peerId.toB58String()}
                            />
                        ) : (
                            <></>
                        )}
                    </div>
                </div>
            </nav>

            <Transition
                show={isMobileOpen}
                enter="transform transition ease-in-out duration-500"
                enterFrom="-translate-y-[100vw]"
                enterTo="translate-y-0"
                leave="transform transition ease-in-out duration-500"
                leaveFrom="translate-y-0"
                leaveTo="-translate-y-[100vw]"
                className="absolute z-20 right-0 top-[54px]"
            >
                <ul className="flex flex-col w-screen bg-brand-dashboard shadow-md p-2 items-start">
                    {NAV_ITEMS.map((item, i) => (
                        <li key={`nav-item-${i}`} className="w-full">
                            <button
                                className="w-full flex gap-2 items-center justify-end px-4 py-2"
                                onClick={() => {
                                    navigate(`${item.route}`);
                                    setIsMobileOpen(false);
                                }}
                            >
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
                enter="transition-opacity ease-in-out duration-500 delay-100"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity ease-in-out duration-400"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                className={`fixed bottom-0 left-0 w-screen h-full flex flex-grow z-10`}
            >
                <div
                    className="w-screen h-full bg-[rgba(0,0,0,0.25)]"
                    onClick={() => setIsMobileOpen(false)}
                />
            </Transition>
        </>
    );
};
