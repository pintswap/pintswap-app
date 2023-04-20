import { ReactNode } from "react"
import { useNavigate } from "react-router-dom";
import { ActiveText } from "../components";
import { useWindowSize } from "../hooks/window-size";
import { NAV_ITEMS } from "../utils/common";
import { Avatar } from '../components';

type IDashboardProps = {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: IDashboardProps) => {
  const { width, breakpoint } = useWindowSize();
  const navigate = useNavigate();

  if(width >= breakpoint) {
    // Desktop
    return (
      <div className="grid grid-cols-[1fr_3fr] lg:grid-cols-[1fr_4fr]">
        <ul className="bg-neutral-900 p-4 pl-0 mt-4 h-[85vh] rounded-r-xl max-w-[300px] flex flex-col gap-2 shadow-lg">
          {NAV_ITEMS.map((el, i) => (
            <li key={`sidebar-nav-${i}`}>
              <button 
                onClick={() => navigate(el.route)}
                className={`w-full text-left pl-4 lg:pl-6 xl:pl-8 py-2 flex items-center gap-2 transition duration-200 hover:text-indigo-300`}
              >
                <ActiveText route={el.route} className="text-indigo-500">
                  {el.icon}
                </ActiveText>
                <ActiveText route={el.route}>
                  {el.text}
                </ActiveText>
              </button>
            </li>
          ))}
        </ul>
        <main className="max-w-4xl w-full p-4 mt-2 mx-auto">
          {children}
        </main>
      </div>
    )
  } else {
    // Mobile
    return (
      <>
        <div className="flex justify-center">
          <main className="max-w-4xl w-full p-4">
            {children}
          </main>
        </div>

        <div className="absolute left-2 bottom-2">
          <Avatar clickable />
        </div>
      </>
    )
  }
}