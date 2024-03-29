import { Fragment, ReactNode, MouseEventHandler } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { classNames } from '../../utils/format';
import { useNavigate } from 'react-router-dom';
import { ActiveText } from './active-text';
import { AnimatedHamburger } from './animated-hamburger';

export type IDropdownMenuItemsProps = {
    text: string;
    onClick?: () => void;
    disabled?: boolean;
    icon?: ReactNode;
    route?: string;
};

type IDropdownMenuProps = {
    customIcon?: ReactNode;
    items: IDropdownMenuItemsProps[];
    buttonClass?: string;
    onClick?: MouseEventHandler<HTMLButtonElement>;
};

export const DropdownMenu = ({ items, customIcon, buttonClass, onClick }: IDropdownMenuProps) => {
    const navigate = useNavigate();

    const genericHamburgerLine = `h-1 w-6 my-[3px] rounded-full bg-white transition ease transform duration-150 rounded`;
    return (
        <Menu
            as="div"
            className="relative inline-block text-left focus-visible:outline-none focus-visible:border-none ring-0"
        >
            {({ open }) => (
                <>
                    <Menu.Button className={`${buttonClass ? buttonClass : ''}`}>
                        {customIcon ? customIcon : <AnimatedHamburger state={open} />}
                    </Menu.Button>

                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-brand-dashboard shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            {items.map((item, i) => (
                                <Menu.Item key={`dropdown-menu-item-${i}`}>
                                    {({ active }) =>
                                        item.route ? (
                                            <button
                                                className={classNames(
                                                    active ? 'bg-neutral-900 text-neutral-100' : '',
                                                    'px-4 py-3 text-sm w-full text-left flex gap-2 items-center justify-start rounded-md disabled:text-neutral-400',
                                                )}
                                                onClick={() => navigate(item.route || '/')}
                                                disabled={item.disabled}
                                            >
                                                <ActiveText
                                                    route={item.route}
                                                    className="text-primary"
                                                >
                                                    {item.icon}
                                                </ActiveText>
                                                <ActiveText route={item.route}>
                                                    {item.text}
                                                </ActiveText>
                                            </button>
                                        ) : (
                                            <button
                                                className={classNames(
                                                    active ? 'bg-neutral-900 text-neutral-100' : '',
                                                    'px-4 py-3 text-sm w-full text-left flex gap-2 items-center justify-start rounded-md disabled:text-neutral-400',
                                                )}
                                                onClick={onClick ? onClick : item.onClick}
                                                disabled={item.disabled}
                                            >
                                                {item.text}
                                                {item.icon}
                                            </button>
                                        )
                                    }
                                </Menu.Item>
                            ))}
                        </Menu.Items>
                    </Transition>
                </>
            )}
        </Menu>
    );
};
