import { ReactNode } from "react"
import { MdAddCircleOutline, MdListAlt } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import { useWindowSize } from "../hooks/window-size";

type IDashboardProps = {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: IDashboardProps) => {
  const { pathname } = useLocation();
  const { width, breakpoint } = useWindowSize();
  const navigate = useNavigate();
  const iconSize = '20px';

  const SIDEBAR_ITEMS = [
    { text: 'Pairs', route: '/pairs', disabled: false, icon: <MdListAlt size={iconSize} /> },
    { text: 'Open Orders', route: '/open', disabled: false, icon: <MdListAlt size={iconSize} /> },
    { text: 'Your Orders', route: '/', disabled: false, icon: <MdListAlt size={iconSize} /> },
    { text: 'Create', route: '/create', disabled: false, icon: <MdAddCircleOutline size={iconSize} /> },
  ]

  if(width > breakpoint) {
    // Desktop
    return (
      <div className="grid grid-cols-[1fr_3fr] lg:grid-cols-[1fr_4fr]">
        <ul className="bg-neutral-900 p-4 pl-0 mt-4 h-[85vh] rounded-r-xl max-w-[300px] flex flex-col gap-2">
          {SIDEBAR_ITEMS.map((el, i) => (
            <li key={`sidebar-nav-${i}`}>
              <button 
                onClick={() => navigate(el.route)}
                className={`w-full text-left pl-4 lg:pl-6 xl:pl-8 py-2 flex items-center gap-2 transition duration-200 hover:text-indigo-300`}
              >
                <span className={`${pathname === el.route ? 'text-indigo-500' : ''}`}>{el.icon}</span>
                <span className={`${pathname === el.route ? 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-sky-400' : ''}`}>
                  {el.text}
                </span>
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
      <div className="flex justify-center">
        <div>
          
        </div>
        <main className="max-w-4xl w-full p-4">
          {children}
        </main>
      </div>
    )
  }
}

                {/* <main className="flex justify-center">
                    <div className="max-w-4xl w-full p-4">
                        {pathname !== '/' && (
                            <Button
                                className="gap-1 mb-6"
                                type="transparent"
                                onClick={() => navigate(-1)}
                            >
                                <MdChevronLeft />
                                Back
                            </Button>
                        )}
                        {children}
                    </div>
                </main> */}