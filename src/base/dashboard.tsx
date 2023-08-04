import { ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ActiveText, StatusIndicator } from '../components';
import { Avatar } from '../components';
import { useAccount } from 'wagmi';
import { useDashNav, useWindowSize } from '../hooks';
import { usePintswapContext, useUserContext } from '../stores';

type IDashboardProps = {
    children: ReactNode;
};

const backgroundClass = `bg-[conic-gradient(at_bottom,_var(--tw-gradient-stops))] from-neutral-800 via-black to-neutral-800`;

export const DashboardLayout = ({ children }: IDashboardProps) => {
    const { address } = useAccount();
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
                    <ul className={`flex flex-col gap-1.5`}>
                        {NAV_ITEMS.map((el, i) => {
                            return (
                                <li key={`sidebar-nav-${i}`}>
                                    <button
                                        onClick={() => navigate(el.route || '/')}
                                        className={`w-full text-left pl-4 pr-6 lg:pl-6 lg:pr-12 xl:pr-16 py-2 flex items-center gap-1 lg:gap-2 transition duration-200 hover:text-neutral-400`}
                                    >
                                        <ActiveText route={el.route} className="text-sky-400">
                                            {el.icon}
                                        </ActiveText>
                                        <ActiveText route={el.route}>{el.text}</ActiveText>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                    <div className="flex flex-col gap-2 pl-4 lg:pl-6">
                        <Avatar
                            peer={pintswap?.module?.peerId.toB58String()}
                            withName
                            direction="vertical"
                            align="left"
                            ring
                        />
                        <button onClick={toggleActive}>
                            <StatusIndicator
                                active={active}
                                message={active ? 'Stop Publish' : 'Start Publish'}
                            />
                        </button>
                    </div>
                </div>
                <div
                    className={`overflow-y-auto w-full p-6 lg:p-8 ${backgroundClass} relative z-50 shadow-[rgba(0,0,0,1)_0px_0px_10px_0px] 3xl:px-6 h-full rounded-tl-3xl`}
                >
                    <main className="mx-auto">{children}</main>
                </div>
            </div>
        );
    } else {
        // Mobile
        return (
            <>
                <div className="flex flex-grow justify-center">
                    <main className={`w-full py-4 px-2 pb-6 ${backgroundClass} h-full`}>
                        {children}
                    </main>
                </div>

                {address && (
                    <div className="fixed left-2 bottom-2">
                        <Avatar
                            type="clickable"
                            showActive
                            peer={pintswap?.module?.peerId.toB58String()}
                        />
                    </div>
                )}
            </>
        );
    }
};
