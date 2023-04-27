import { ReactNode } from "react"
import { useNavigate } from "react-router-dom";
import { ActiveText } from "../components";
import { useWindowSize } from "../hooks/window-size";
import { Avatar } from '../components';
import { useGlobalContext } from "../stores";
import { useAccount } from "wagmi";

type IDashboardProps = {
  children: ReactNode;
}

export const dashboardHeightClass = `h-[calc(100vh-68px)] lg:h-[calc(100vh-84px)]`
export const dashboardColor = `bg-neutral-900`;

export const DashboardLayout = ({ children }: IDashboardProps) => {
  const { address } = useAccount();
  const { width, breakpoints } = useWindowSize();
  const { NAV_ITEMS } = useGlobalContext();
  const navigate = useNavigate();

  if(width >= breakpoints.md) {
    // Desktop
    return (
      <div className={`flex ${dashboardHeightClass}`}>
        <ul className={`${dashboardColor} p-4 py-6 pl-0 flex flex-col gap-2`}>
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
        <div className="overflow-y-scroll w-full px-4 lg:px-6 py-8 shadow-inner shadow-neutral-950">
          <main className="max-w-7xl mx-auto">
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
          <main className="w-full p-4">
            {children}
          </main>
        </div>

        {address && (
          <div className="fixed left-2 bottom-2">
            <Avatar type="clickable" />
          </div>
        )}
      </>
    )
  }
}