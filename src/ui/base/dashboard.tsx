import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActiveText, StatusIndicator, TooltipWrapper } from '../components';
import { Avatar } from '../features';
import { useAccount } from 'wagmi';
import { useDashNav, useWindowSize } from '../../hooks';
import { usePintswapContext, useUserContext } from '../../stores';
import { APP_VERSION } from '../../utils';

type IDashboardProps = {
    children: ReactNode;
};

const backgroundClass = `bg-[conic-gradient(at_bottom,_var(--tw-gradient-stops))] from-neutral-800 via-black to-neutral-800`;

export const DashboardLayout = ({ children }: IDashboardProps) => {
    const { address } = useAccount();
    const { userData } = useUserContext();
    const { width, breakpoints } = useWindowSize();
    const { NAV_ITEMS } = useDashNav();
    const {
        toggleActive,
        userData: { active },
    } = useUserContext();
    const { pintswap } = usePintswapContext();
    const navigate = useNavigate();

    if (width >= breakpoints.md) {
        // Desktop
        return (
            <div className={`3xl:max-w-8xl 3xl:w-full 3xl:mx-auto flex 3xl:gap-6 flex-grow`}>
                <div className="flex flex-col justify-between bg-brand-dashboard p-4 py-6 pl-0 gap-2">
                    <ul className={`flex flex-col gap-1 xl:gap-1.5`}>
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
                                            className={`w-full text-left pl-4 pr-6 lg:pl-6 lg:pr-12 xl:pr-16 py-1.5 2xl:py-2 flex items-center gap-1 lg:gap-2 transition duration-200 hover:text-neutral-300`}
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
                    <div className="flex flex-col gap-2 pl-4 lg:pl-6">
                        <Avatar
                            peer={pintswap.module?.address}
                            type="clickable"
                            direction="vertical"
                            align="left"
                            withName
                            truncated
                        />
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
                        <span className="text-xs 2xl:text-sm text-neutral-500">{APP_VERSION}</span>
                    </div>
                </div>
                <div
                    className={`max-h-[calc(100vh-60px)] lg:max-h-[calc(100vh-72px)] overflow-y-auto w-full p-6 lg:p-8 xl:px-12 2xl:px-24 3xl:px-48 ${backgroundClass} shadow-[rgba(0,0,0,1)_0px_0px_10px_0px] h-full rounded-tl-3xl 3xl:rounded-t-3xl`}
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
                    <main className={`w-full pt-3 px-2 pb-12 ${backgroundClass} h-full`}>
                        {children}
                    </main>
                </div>

                {address && (
                    <div className="fixed left-2 bottom-1">
                        <Avatar
                            size={42}
                            type="clickable"
                            showActive
                            peer={pintswap?.module?.address}
                        />
                    </div>
                )}
            </>
        );
    }
};
