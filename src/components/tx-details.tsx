import { Disclosure, Transition } from '@headlessui/react'
import { IOffer } from '@pintswap/sdk';
import { useEffect, useState } from 'react';
import { BiChevronUp } from 'react-icons/bi';
import { fetchFeeData } from '@wagmi/core'
import { utils } from 'ethers';

type ITxDetailsProps = {
  trade: IOffer;
  loading?: boolean;
  type: 'fulfill' | 'create'
}

export const TxDetails = ({ trade, loading, type }: ITxDetailsProps) => {
  // const [gas, setGas] = useState('0');

  const sending = type === 'fulfill' ? trade.gets : trade.gives;
  const receiving = type === 'fulfill' ? trade.gives : trade.gets;

  // useEffect(() => {
  //   // TODO: get function gas price and multiply by gas Price
  //   (async () => {
  //       const { formatted } = await fetchFeeData();
  //       if(formatted.gasPrice) {
  //         const formattedGasPrice = utils.formatEther(formatted.gasPrice);
  //         setGas(formattedGasPrice)
  //       }
  //   })().catch((err) => console.error(err));
  // }, [])

  return (
    <Disclosure>
      {({ open, close }) => (
        <>
          <Disclosure.Button 
            className={`w-full flex items-center justify-between bg-neutral-800 p-2 ${open ? 'rounded-t' : 'rounded'} text-neutral-300 hover:text-white transition duration-200`}
            disabled={loading}
          >
            <span className="text-sm lg:text-md font-extralight">Transaction Details</span>
            <BiChevronUp
              className={`transition duration-150 transform ${open ? 'rotate-180 transform' : ''}`}
              size="20"
            />
          </Disclosure.Button>

          <Transition
            enter="transition duration-100 ease-out"
            // enterFrom="transform scale-95 opacity-0"
            // enterTo="transform scale-100 opacity-100"
                        enterFrom="transform h-0 scale-95 opacity-0"
            enterTo="transform h-full scale-100 opacity-100"
            leave="transition duration-100 ease-out"
            // leaveFrom="transform scale-100 opacity-100"
            // leaveTo="transform scale-95 opacity-0"
                        leaveFrom="transform h-full scale-100 opacity-100"
            leaveTo="transform h-0 scale-95 opacity-0"
          >
            <Disclosure.Panel className="p-2 pt-1 rounded-b bg-neutral-800 text-xs lg:text-sm font-extralight space-y-1 cursor-pointer" as="ul" onClick={() => close()}>
              <li className="flex items-center justify-between">
                <span>Sending</span>
                <span>{sending.amount} {sending.token}</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Receiving</span>
                <span>{receiving.amount} {receiving.token}</span>
              </li>
              {/* <li className="flex items-center justify-between">
                <span>Gas</span>
                <span>{gas} ETH</span>
              </li> */}
            </Disclosure.Panel>
          </Transition>
        </>
      )}
    </Disclosure>
  )
}