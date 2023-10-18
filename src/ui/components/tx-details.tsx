import { Disclosure, Transition } from '@headlessui/react';
import { IOffer } from '@pintswap/sdk';
import { BiChevronUp } from 'react-icons/bi';
import { convertAmount } from '../../utils';
import { useEffect, useState } from 'react';
import { usePintswapContext } from '../../stores';

type ITxDetailsProps = {
    trade: IOffer;
    loading?: boolean;
    type: 'fulfill' | 'create';
};

export const TxDetails = ({ trade, loading, type }: ITxDetailsProps) => {
    const {
        pintswap: { module, chainId },
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
                    chainId,
                ),
                receiving: await convertAmount(
                    'readable',
                    receiving.amount || '0',
                    receiving.token,
                    chainId,
                ),
            });
        })().catch((err) => console.error(err));
    }, [trade]);

    return (
        <Disclosure>
            {({ open, close }) => (
                <div>
                    <Disclosure.Button
                        className={`w-full flex items-center justify-between bg-neutral-900 p-3 ${
                            open
                                ? 'rounded-t-lg text-neutral-100'
                                : 'rounded-lg text-neutral-400 hover:text-neutral-300'
                        } transition-all duration-100`}
                        disabled={loading}
                    >
                        <span className="text-sm lg:text-md font-extralight">
                            Transaction Details
                        </span>
                        <BiChevronUp
                            className={`${open ? 'rotate-180 transform' : ''}`}
                            size="20"
                        />
                    </Disclosure.Button>

                    <Transition
                        enter="transition duration-100 ease-out"
                        enterFrom="transform scale-95 opacity-0"
                        enterTo="transform scale-100 opacity-100"
                        leave="transition duration-100 ease-out"
                        leaveFrom="transform scale-100 opacity-100"
                        leaveTo="transform scale-95 opacity-0"
                    >
                        <Disclosure.Panel
                            className="p-3 pt-1 rounded-b-lg bg-neutral-900 text-xs lg:text-sm font-extralight space-y-1 cursor-pointer"
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
                </div>
            )}
        </Disclosure>
    );
};
