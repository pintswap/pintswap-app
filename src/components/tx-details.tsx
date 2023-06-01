import { Disclosure, Transition } from '@headlessui/react';
import { IOffer } from '@pintswap/sdk';
import { BiChevronUp } from 'react-icons/bi';
import { convertAmount } from '../utils/token';
import { useEffect, useState } from 'react';
import { usePintswapContext } from '../stores';

type ITxDetailsProps = {
    trade: IOffer;
    loading?: boolean;
    type: 'fulfill' | 'create';
};

export const TxDetails = ({ trade, loading, type }: ITxDetailsProps) => {
    const {
        pintswap: { module },
    } = usePintswapContext();
    const [displayTrade, setDisplayTrade] = useState({ sending: '0', receiving: '0' });
    const sending = trade.gives;
    // type === 'fulfill' ? trade.gets : trade.gives;
    const receiving = trade.gets;
    // type === 'fulfill' ? trade.gives : trade.gets;

    useEffect(() => {
        (async () => {
            setDisplayTrade({
                sending: await convertAmount(
                    'readable',
                    sending.amount || '0',
                    sending.token,
                    module?.signer,
                ),
                receiving: await convertAmount(
                    'readable',
                    receiving.amount || '0',
                    receiving.token,
                    module?.signer,
                ),
            });
        })().catch((err) => console.error(err));
    }, [trade]);

    return (
        <Disclosure>
            {({ open, close }) => (
                <>
                    <Disclosure.Button
                        className={`w-full flex items-center justify-between bg-neutral-800 p-2 ${
                            open ? 'rounded-t' : 'rounded'
                        } text-neutral-300 hover:text-white transition duration-200`}
                        disabled={loading}
                    >
                        <span className="text-sm lg:text-md font-extralight">
                            Transaction Details
                        </span>
                        <BiChevronUp
                            className={`transition duration-150 transform ${
                                open ? 'rotate-180 transform' : ''
                            }`}
                            size="20"
                        />
                    </Disclosure.Button>

                    <Transition
                        enter="transition duration-100 ease-out"
                        enterFrom="transform h-0 scale-95 opacity-0"
                        enterTo="transform h-full scale-100 opacity-100"
                        leave="transition duration-100 ease-out"
                        leaveFrom="transform h-full scale-100 opacity-100"
                        leaveTo="transform h-0 scale-95 opacity-0"
                    >
                        <Disclosure.Panel
                            className="p-2 pt-1 rounded-b bg-neutral-800 text-xs lg:text-sm font-extralight space-y-1 cursor-pointer"
                            as="ul"
                            onClick={() => close()}
                        >
                            <li className="flex items-center justify-between">
                                <span>Sending</span>
                                <span>{displayTrade.sending}</span>
                            </li>
                            <li className="flex items-center justify-between">
                                <span>Receiving</span>
                                <span>{displayTrade.receiving}</span>
                            </li>
                        </Disclosure.Panel>
                    </Transition>
                </>
            )}
        </Disclosure>
    );
};
