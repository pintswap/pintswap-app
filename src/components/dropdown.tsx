import { ChangeEvent, Fragment, MouseEventHandler, useRef, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { MdChevronRight } from 'react-icons/md'
import { alphaTokenSort, classNames } from '../utils/common'
import { ITokenProps, TOKENS } from '../utils/token-list'
import { MdOutlineAddCircleOutline, MdOutlineListAlt } from 'react-icons/md'
import { Input } from './input'

type IDropdownProps = {
  state: any;
  setState?: any;
  options?: string[];
  placeholder?: string;
  type: 'givesToken' | 'getsToken' | 'string';
  title?: string;
  search?: boolean;
  disabled?: boolean;
  loading?: boolean;
  customInput?: boolean;
}

export const Dropdown = ({ state, setState, options, placeholder, type, title, search, disabled, loading, customInput }: IDropdownProps) => {
  const isToken = type === 'givesToken' || type === 'getsToken';
  const [searchState, setSearchState] = useState({ query: '', list: isToken ? TOKENS : options || [] });
  const [isCustom, setIsCustom] = useState(false);
  
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      let results;
      if(isToken) {
        results = TOKENS.filter((el: ITokenProps) => {
          if (e.target.value === "") return TOKENS;
          return el.symbol.toLowerCase().includes(e.target.value.toLowerCase())
        })
      } else {
        results = (searchState.list as string[]).filter((el) => {
          if (e.target.value === "") return searchState.list;
          return el.toLowerCase().includes(e.target.value.toLowerCase())
        })
      }
      setSearchState({
        query: e.target.value,
        list: results
      })
  };

  const toggleCustomInput = () => {
    setIsCustom(!isCustom);
    isToken ? setState(type, '') : setState('')
  };

  return (
    <div className="flex flex-col gap-1 justify-end">
      <div className="flex justify-between items-center text-sm">
        {title && (<p>{title}</p>)}
        {customInput && (
          <button className="text-indigo-600 flex gap-1 items-center transition duration-200 hover:text-indigo-700" onClick={toggleCustomInput}>
            {isCustom ? 'Show Dropdown' : 'Custom Token'}
            {isCustom ? <MdOutlineListAlt /> : <MdOutlineAddCircleOutline />}
          </button>
        )}
      </div>
      {isCustom ? (
        <Input 
          placeholder="Token Address"
          value={state}
          onChange={(e) => setState(type, e.currentTarget.value)}
          type="text"
          noSpace
          token
        />
      ) : (
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button 
              className={`inline-flex w-full ${!disabled ? 'justify-between' : 'justify-end'} items-center gap-x-1.5 rounded bg-neutral-600 px-3 py-2 hover:bg-neutral-500 transition duration-150 disabled:hover:cursor-not-allowed disabled:hover:bg-neutral-600 ${loading ? 'animate-pulse' : ''}`}
              disabled={disabled} 
            >
              {!disabled && <MdChevronRight className="h-5 w-5 rotate-90 " aria-hidden="true" />}
              {state ? state : <span className="text-gray-400">{placeholder || 'Select one...'}</span>}
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
            <Menu.Items className="absolute right-0 z-10 mt-2 origin-top rounded-md bg-gray-900 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none w-full max-h-60 overflow-y-auto overflow-x-hidden">
              {search && (
                  <input 
                    value={searchState.query}
                    onChange={handleChange}
                    className="bg-gray-700 text-neutral-200 px-4 py-2 text-sm ring-2 ring-gray-600 w-full"
                    placeholder="Search here..."
                  />
              )}
              {isToken ? (searchState.list as ITokenProps[]).sort(alphaTokenSort).map((el: ITokenProps, i) => (
                <Menu.Item key={`dropdown-item-${el.symbol}-${i}`}>
                {({ active }) => (
                  <button
                    className={classNames(
                      active ? 'bg-gray-800 text-neutral-200' : 'text-neutral-300',
                      'flex items-center gap-2 px-4 py-2 text-sm transition duration-150 w-full'
                    )}
                    onClick={() => setState(type, el.symbol)}
                  >
                    <img src={el.logoURI} alt={el.asset} width="25" height="25" />
                    {el.symbol}
                  </button>
                )}
              </Menu.Item>
              )) : (searchState.list as string[]).map((el, i) => (
                <Menu.Item key={`dropdown-item-${el}-${i}`}>
                {({ active }) => (
                  <button
                    className={classNames(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'block px-4 py-2 text-sm transition duration-150'
                    )}
                    onClick={() => setState(el)}
                  >
                    {el}
                  </button>
                )}
              </Menu.Item>
              ))}

            </Menu.Items>
          </Transition>
        </Menu>
      )}
    </div>
  )
}