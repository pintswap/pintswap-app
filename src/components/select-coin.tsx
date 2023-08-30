import { MdExpandMore } from 'react-icons/md';
import { Asset } from './asset';
import { TransitionModal } from './modal';
import { Card } from './card';
import { Input } from './input';
import { useSearch } from '../hooks';
import { ITokenProps, TOKENS, alphaTokenSort, dropdownItemClass } from '../utils';
import { useState } from 'react';
import { MdClose } from 'react-icons/md';

type ISelectCoin = {
    asset?: string;
};

export const SelectCoin = ({ asset }: ISelectCoin) => {
    const { query, list, handleChange } = useSearch(TOKENS);
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <>
            <TransitionModal
                button={
                    <span
                        className={`transition duration-100 flex items-center gap-1 flex-none rounded-full p-1 min-w-max ${
                            asset
                                ? 'bg-neutral-600 hover:bg-neutral-500'
                                : 'bg-indigo-600 hover:bg-indigo-hover'
                        }`}
                    >
                        {asset ? (
                            <Asset symbol={asset} />
                        ) : (
                            <span className="pl-2 flex items-center">
                                Select<span className="hidden sm:block ml-[5px]">a token</span>
                            </span>
                        )}
                        <MdExpandMore />
                    </span>
                }
                modalClass={`w-full !max-w-xl`}
                state={modalOpen}
                setState={setModalOpen}
            >
                <Card className="w-full border border-neutral-800">
                    <div className="flex flex-col gap-2 lg:gap-3">
                        <div className="flex items-center justify-between">
                            <span>Select a token</span>
                            <button
                                className="p-2 relative -mt-2 -mr-2"
                                onClick={() => setModalOpen(false)}
                            >
                                <MdClose
                                    size={28}
                                    className="hover:text-neutral-300 transition duration-100"
                                />
                            </button>
                        </div>

                        <Input
                            value={query}
                            onChange={handleChange}
                            placeholder="Search name or paste address"
                            type="search"
                            className="w-full"
                        />

                        <div className="h-80 overflow-y-scroll">
                            {(list as ITokenProps[])
                                .sort(alphaTokenSort)
                                .map((el: ITokenProps, i) => (
                                    <div key={`dropdown-item-${el.symbol}-${i}`}>
                                        <button
                                            className={`${dropdownItemClass(
                                                false,
                                            )} transition duration-100 hover:bg-neutral-900`}
                                            onClick={() => console.log(el.symbol)}
                                        >
                                            <Asset
                                                icon={el.logoURI}
                                                symbol={el.symbol}
                                                alt={el.asset}
                                                fontSize="text-lg"
                                                size={30}
                                            />
                                        </button>
                                    </div>
                                ))}
                        </div>
                    </div>
                </Card>
            </TransitionModal>
        </>
    );
};
