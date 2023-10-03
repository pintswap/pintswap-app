import { Transition } from '@headlessui/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActiveText, AnimatedHamburger, ChainDropdown, Gas, Wallet } from '../components';
import { useDashNav, useWindowSize } from '../hooks';
import { APP_VERSION } from '../utils';
import { useAccount } from 'wagmi';

export const Navbar = () => {
    const { NAV_ITEMS } = useDashNav();
    const { address } = useAccount();
    const { width, breakpoints } = useWindowSize();
    const navigate = useNavigate();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const logoSize = { width: '159', height: '28' };

    return (
        <>
            <nav
                className={`bg-brand-dashboard py-2 lg:py-3 2xl:py-4 px-2 md:px-3 lg:px-6 w-full z-50 md:z-auto relative`}
            >
                <div className="3xl:max-w-8xl mx-auto grid grid-cols-2 items-center">
                    <button onClick={() => navigate('/')} className="flex gap-1">
                        <img
                            src="/logo/pintswap-logo.svg"
                            alt="PintSwap Logo"
                            height={logoSize.height}
                            width={logoSize.width}
                        />
                    </button>
                    <div className={`flex items-center gap-2 justify-self-end bg-brand-dashboard`}>
                        {breakpoints.md <= width ? (
                            // Desktop
                            <div className="flex items-center gap-2">
                                <Gas className="mr-2" units="gwei" />
                                <ChainDropdown />
                                <Wallet />
                            </div>
                        ) : (
                            // Mobile
                            <div className="flex items-center gap-2">
                                {address ? <ChainDropdown /> : <Wallet />}
                                <button
                                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                                    className="px-0.5"
                                >
                                    <AnimatedHamburger state={isMobileOpen} />
                                </button>
                            </div>
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
                                className={`w-full flex gap-2 items-center ${
                                    i === 0 ? 'justify-between' : 'justify-end'
                                } px-4 py-2`}
                                onClick={() => {
                                    navigate(`${item.route}`);
                                    setIsMobileOpen(false);
                                }}
                            >
                                {i === 0 && (
                                    <span className="text-sm text-neutral-500">{APP_VERSION}</span>
                                )}
                                <span className="flex items-center gap-2">
                                    <ActiveText route={item.route || ''}>
                                        {item.text.toUpperCase()}
                                    </ActiveText>
                                    <ActiveText
                                        route={item.route || ''}
                                        className="text-primary-light"
                                    >
                                        {item.icon}
                                    </ActiveText>
                                </span>
                            </button>
                        </li>
                    ))}
                    <li className="w-full pb-2 mt-2">
                        <Wallet fullWidth />
                    </li>
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
