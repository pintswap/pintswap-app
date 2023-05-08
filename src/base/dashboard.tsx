import { ReactNode } from "react"
import { useNavigate } from "react-router-dom";
import { ActiveText } from "../components";
import { Avatar } from '../components';
import { useAccount } from "wagmi";
import { useDashNav, useWindowSize } from "../hooks";
import { usePintswapContext } from "../stores";

type IDashboardProps = {
  children: ReactNode;
}

export const dashboardHeightClass = `h-[calc(100vh-68px)] lg:h-[calc(100vh-84px)]`

export const DashboardLayout = ({ children }: IDashboardProps) => {
  const { address } = useAccount();
  const { width, breakpoints } = useWindowSize();
  const { NAV_ITEMS } = useDashNav();
  const { pintswap } = usePintswapContext();
  const navigate = useNavigate();

  if(width >= breakpoints.md) {
    // Desktop
    return (
      <div className={`3xl:max-w-8xl 3xl:px-12 3xl:w-full 3xl:mx-auto flex 3xl:gap-6 ${dashboardHeightClass}`}>
        <ul className={`bg-brand-dashboard p-4 py-6 pl-0 flex flex-col gap-2 3xl:h-5/6 3xl:my-auto 3xl:rounded-lg`}>
          {NAV_ITEMS.map((el, i) => (
            <li key={`sidebar-nav-${i}`}>
              <button 
                onClick={() => navigate(el.route || '/')}
                className={`w-full text-left pl-4 pr-6 lg:pl-6 lg:pr-12 xl:pr-20 py-2 flex items-center gap-1 lg:gap-2 transition duration-200 hover:text-indigo-300`}
              >
                <ActiveText route={el.route || ''} className="text-indigo-500">
                  {el.icon}
                </ActiveText>
                <ActiveText route={el.route || ''}>
                  {el.text}
                </ActiveText>
              </button>
            </li>
          ))}
        </ul>
        <div className="overflow-y-scroll w-full px-4 lg:px-6 py-8 mb-2 shadow-inner shadow-neutral-950 3xl:shadow-none 3xl:px-0 h-full">
          <main className="mx-auto">
            {children}
          </main>
        </div>
      </div>
    )
  } else {
    // Mobile
    return (
      <>
        <div className="flex justify-center">
          <main className="w-full p-4 mb-6">
            {children}
          </main>
        </div>

        {address && (
          <div className="fixed left-2 bottom-2">
            <Avatar type="clickable" showActive peer={pintswap?.module?.peerId.toB58String()} />
          </div>
        )}
      </>
    )
  }
}