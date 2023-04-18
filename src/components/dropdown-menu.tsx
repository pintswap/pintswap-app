import { Fragment, ReactNode } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { TiThMenu } from 'react-icons/ti'
import { classNames } from '../utils/common'
import { useNavigate } from 'react-router-dom'
import { ActiveText } from './active-text'

type IDropdownMenuProps = {
  customIcon?: ReactNode;
  items: {
    text: string;
    onClick?: () => void;
    disabled?: boolean;
    icon?: ReactNode;
    route?: string;
  }[];

}

export const DropdownMenu = ({ items, customIcon }: IDropdownMenuProps) => {
  const navigate = useNavigate();
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="py-1">
          {customIcon ? customIcon : (
            <TiThMenu size="26px" />
          )}
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-gray-900 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {items.map((item, i) => (
            <Menu.Item key={`dropdown-menu-item-${i}`}>
              {({ active }) => item.route ? (
                <button
                  className={classNames(
                    active ? 'bg-gray-800 text-neutral-100' : '',
                    'px-4 py-3 text-sm w-full text-right flex gap-2 items-center justify-end rounded-md disabled:text-neutral-400'
                  )}
                  onClick={() => navigate(item.route || '/')}
                  disabled={item.disabled}
                >
                  <ActiveText route={item.route} className="text-indigo-500">
                    {item.icon}
                  </ActiveText>
                  <ActiveText route={item.route}>
                    {item.text}
                  </ActiveText>
                </button>
              ) : (
                <button
                  className={classNames(
                    active ? 'bg-gray-800 text-neutral-100' : '',
                    'px-4 py-3 text-sm w-full text-right flex gap-2 items-center justify-end rounded-md disabled:text-neutral-400'
                  )}
                  onClick={item.onClick}
                  disabled={item.disabled}
                >
                  {item.text}
                  {item.icon}
                </button>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
