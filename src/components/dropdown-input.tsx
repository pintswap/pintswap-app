import { Dispatch, Fragment, SetStateAction } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { MdChevronRight } from 'react-icons/md';
import { alphaTokenSort, classNames, ITokenProps, TOKENS } from '../utils';
import { Asset } from './asset';
import { ethers } from 'ethers';
import { useSearch } from '../hooks';

type IDropdownProps = {
    state: any;
    setState?: Dispatch<SetStateAction<any>> | any;
    options?: string[];
    placeholder?: string;
    type?: 'gives.token' | 'gets.token' | 'string' | 'input-ext';
    title?: string;
    search?: boolean;
    disabled?: boolean;
    loading?: boolean;
};

export const DropdownInput = ({
    state,
    setState,
    options,
    placeholder,
    type = 'string',
    title,
    search,
    disabled,
    loading,
}: IDropdownProps) => {
    const isToken = type === 'gives.token' || type === 'gets.token';
    const { query, list, handleChange } = useSearch(isToken ? TOKENS : options || []);

    const dropdownItemClass = (active: boolean) =>
        classNames(
            active ? 'bg-gray-900 text-neutral-200' : 'text-neutral-300',
            'flex items-center gap-2 px-4 py-2 text-sm transition duration-150 w-full',
        );

    return (
        <div className="flex flex-col gap-1 justify-end">
            <div className="flex justify-between items-center text-xs md:text-sm">
                {title && <p>{title}</p>}
            </div>
            <Menu as="div" className="relative inline-block text-left">
                <div>
                    <Menu.Button
                        className={`inline-flex w-full ${
                            !disabled ? 'justify-between' : 'justify-end'
                        } items-center gap-x-1.5 bg-neutral-600 p-2 hover:bg-neutral-500 transition duration-150 disabled:hover:cursor-not-allowed disabled:hover:bg-neutral-600 ${
                            loading ? 'animate-pulse' : ''
                        } ${type === 'input-ext' ? 'rounded-r' : 'rounded'}`}
                        disabled={disabled}
                    >
                        {!disabled && (
                            <MdChevronRight className="h-5 w-5 rotate-90 " aria-hidden="true" />
                        )}
                        {state ? (
                            state
                        ) : (
                            <span className="text-gray-400">{placeholder || 'Select one...'}</span>
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
                    <Menu.Items className="absolute right-0 z-10 mt-2 origin-top rounded-md bg-gray-950 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none w-full max-h-60 overflow-y-auto overflow-x-hidden">
                        {search && (
                            <input
                                value={query}
                                onChange={handleChange}
                                className="bg-gray-700 text-neutral-200 px-4 py-2 text-sm ring-2 ring-gray-600 w-full"
                                placeholder="Search name or paste address"
                            />
                        )}

                        {isToken
                            ? (list as ITokenProps[])
                                  .sort(alphaTokenSort)
                                  .map((el: ITokenProps, i) => (
                                      <Menu.Item key={`dropdown-item-${el.symbol}-${i}`}>
                                          {({ active }) => (
                                              <button
                                                  className={dropdownItemClass(active)}
                                                  onClick={() => setState(type, el.symbol)}
                                              >
                                                  <Asset
                                                      icon={el.logoURI}
                                                      symbol={el.symbol}
                                                      alt={el.asset}
                                                  />
                                              </button>
                                          )}
                                      </Menu.Item>
                                  ))
                            : (list as string[]).map((el, i) => (
                                  <Menu.Item key={`dropdown-item-${el}-${i}`}>
                                      {({ active }) => (
                                          <button
                                              className={dropdownItemClass(active)}
                                              onClick={() => setState(el)}
                                          >
                                              {el}
                                          </button>
                                      )}
                                  </Menu.Item>
                              ))}

                        {isToken && ethers.utils.isAddress(query) && (
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        className={dropdownItemClass(active)}
                                        onClick={() => setState(type, query)}
                                    >
                                        <Asset
                                            symbol={'Unknown Token'}
                                            icon="/img/generic.svg"
                                            alt="Unknown Token"
                                        />
                                    </button>
                                )}
                            </Menu.Item>
                        )}
                    </Menu.Items>
                </Transition>
            </Menu>
        </div>
    );
};
