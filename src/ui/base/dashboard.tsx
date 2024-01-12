import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActiveText, StatusIndicator, TooltipWrapper } from '../components';
import { Avatar } from '../features';
import { useAccount } from 'wagmi';
import { useDashNav, useWindowSize } from '../../hooks';
import { usePintswapContext, useUserContext } from '../../stores';
import { APP_VERSION } from '../../utils';
import { Transition } from '@headlessui/react';
import { FadeIn } from '../transitions';

type IDashboardProps = {
    children: ReactNode;
};

export const dashboardBgColor = `bg-[conic-gradient(at_bottom,_var(--tw-gradient-stops))] from-brand-dashboard via-[#1e1e1e] to-brand-dashboard`;
export const layoutBgColor = `bg-neutral-900`;

export const DashboardLayout = ({ children }: IDashboardProps) => {
    const { address } = useAccount();
    const { userData, offers } = useUserContext();
    const { width, breakpoints } = useWindowSize();
    const { NAV_ITEMS } = useDashNav();
    const {
        toggleActive,
        userData: { active },
    } = useUserContext();
    const { pintswap, incorrectSigner } = usePintswapContext();
    const navigate = useNavigate();

    if (width >= breakpoints.md) {
        // Desktop
        return (
            <div className={`3xl:max-w-8xl 3xl:w-full 3xl:mx-auto flex 3xl:gap-6 flex-grow`}>
                <div
                    className={`${layoutBgColor} flex flex-col justify-between p-4 py-6 pl-0 gap-2 pr-10 2xl:pr-12`}
                >
                    <ul className={`flex flex-col gap-0.5 2xl:gap-1`}>
                        {NAV_ITEMS.map((el, i) => {
                            return (
                                <li key={`sidebar-nav-${i}`}>
                                    <TooltipWrapper
                                        id={`sidebar-nav-${i}`}
                                        text={el.tooltip}
                                        position="right"
                                    >
                                        <button
                                            onClick={() => navigate(el.route || '/')}
                                            className={`w-full text-left pl-4 lg:pl-6 py-1.5 flex items-center gap-1 lg:gap-2 transition duration-150 hover:text-neutral-300 disabled:text-neutral-500 disabled:hover:text-neutral-500 disabled:cursor-not-allowed pr-4`}
                                            disabled={el.text === 'NFTs'}
                                        >
                                            <ActiveText
                                                route={el.route}
                                                className="text-accent-light"
                                            >
                                                {el.icon}
                                            </ActiveText>
                                            <ActiveText route={el.route}>{el.text}</ActiveText>
                                        </button>
                                    </TooltipWrapper>
                                </li>
                            );
                        })}
                    </ul>
                    <div className="flex flex-col gap-2 w-fit pl-4 lg:pl-6">
                        <FadeIn show={!incorrectSigner}>
                            <div className="flex flex-col gap-2 w-fit">
                                <div className="flex flex-col">
                                    <Avatar
                                        peer={pintswap.module?.address}
                                        type="clickable"
                                        direction="vertical"
                                        align="left"
                                        withName
                                        truncated
                                    />
                                    <span className="text-xs text-neutral-400">
                                        Open Offers: {offers}
                                    </span>
                                </div>
                                <TooltipWrapper
                                    id="dashboard-publish-offers"
                                    text={
                                        userData.active
                                            ? 'Make offers private'
                                            : 'Let others see your offers'
                                    }
                                    position="right"
                                >
                                    <button
                                        onClick={toggleActive}
                                        className="transition duration-100 hover:text-neutral-300 py-0.5"
                                    >
                                        <StatusIndicator
                                            active={active}
                                            message={active ? 'Stop Publish' : 'Start Publish'}
                                        />
                                    </button>
                                </TooltipWrapper>
                            </div>
                        </FadeIn>
                        <span className="text-xs 2xl:text-sm text-neutral-500">{APP_VERSION}</span>
                    </div>
                </div>
                <div
                    className={`md:max-h-[calc(100vh-50px)] overflow-y-auto w-full p-5 lg:px-8 xl:px-10 2xl:px-24 3xl:px-48 ${dashboardBgColor} shadow-inner shadow-[rgba(0,0,0,1)] h-full rounded-tl-2xl 3xl:rounded-t-3xl`}
                >
                    <main className="mx-auto pb-2">{children}</main>
                </div>
            </div>
        );
    } else {
        // Mobile
        return (
            <>
                <div className="flex flex-grow justify-center">
                    <main className={`w-full pt-3 px-2 pb-12 ${dashboardBgColor} h-full`}>
                        {children}
                    </main>
                </div>

                <FadeIn show={!!address && !incorrectSigner}>
                    <div className="fixed left-2 bottom-1">
                        <Avatar
                            size={42}
                            type="clickable"
                            showActive
                            peer={pintswap?.module?.address}
                        />
                    </div>
                </FadeIn>
            </>
        );
    }
};
