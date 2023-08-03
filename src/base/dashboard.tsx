import { ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ActiveText } from '../components';
import { Avatar } from '../components';
import { useAccount } from 'wagmi';
import { useDashNav, useWindowSize } from '../hooks';
import { usePintswapContext } from '../stores';

type IDashboardProps = {
    children: ReactNode;
};

const backgroundClass = `bg-[conic-gradient(at_bottom,_var(--tw-gradient-stops))] from-[#242d49] via-black to-[#242d49]`;

export const DashboardLayout = ({ children }: IDashboardProps) => {
    const { address } = useAccount();
    const { width, breakpoints } = useWindowSize();
    const { NAV_ITEMS } = useDashNav();
    const { pintswap } = usePintswapContext();
    const navigate = useNavigate();

    if (width >= breakpoints.md) {
        // Desktop
        return (
            <div className={`3xl:max-w-8xl 3xl:w-full 3xl:mx-auto flex 3xl:gap-6 flex-grow`}>
                <ul
                    className={`bg-brand-dashboard p-4 py-6 pl-0 flex flex-col gap-2 3xl:h-full 3xl:my-auto 3xl:rounded-md`}
                >
                    {NAV_ITEMS.map((el, i) => {
                        return (
                            <li key={`sidebar-nav-${i}`}>
                                <button
                                    onClick={() => navigate(el.route || '/')}
                                    className={`w-full text-left pl-4 pr-6 lg:pl-6 lg:pr-12 xl:pr-16 py-2 flex items-center gap-1 lg:gap-2 transition duration-200 hover:text-neutral-400`}
                                >
                                    <ActiveText route={el.route} className="text-indigo-500">
                                        {el.icon}
                                    </ActiveText>
                                    <ActiveText route={el.route}>{el.text}</ActiveText>
                                </button>
                            </li>
                        );
                    })}
                </ul>
                <div
                    className={`overflow-y-auto w-full p-6 lg:p-8 mb-2 ${backgroundClass} shadow-[rgba(0,_0,_0,_0.5)_0px_9px_20px] 3xl:px-6 h-full rounded-tl-3xl`}
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
                    <main
                        className={`w-full py-4 px-2 mb-6 ${backgroundClass} shadow-inner shadow-neutral-900 h-full`}
                    >
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
