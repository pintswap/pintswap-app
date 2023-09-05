import { MdExpandMore } from 'react-icons/md';
import { Asset } from './asset';
import { TransitionModal } from './modal';
import { Card } from './card';
import { Input } from './input';
import { useSearch } from '../hooks';
import { ITokenProps, TOKENS, alphaTokenSort, dropdownItemClass, getSymbol } from '../utils';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { MdClose } from 'react-icons/md';
import { ethers } from 'ethers6';
import { usePintswapContext } from '../stores';

type ISelectCoin = {
    asset?: string;
    onAssetClick?: any;
    modalOpen: boolean;
    setModalOpen: Dispatch<SetStateAction<boolean>>;
};

export const SelectCoin = ({ asset, onAssetClick, modalOpen, setModalOpen }: ISelectCoin) => {
    const {
        pintswap: { module },
    } = usePintswapContext();
    const { query, list, handleChange } = useSearch(TOKENS);

    const [unknownToken, setUnknownToken] = useState({ symbol: 'Unknown Token', loading: false });

    useEffect(() => {
        if (ethers.isAddress(query)) {
            (async () => {
                setUnknownToken({ ...unknownToken, loading: true });
                const symbol = await getSymbol(query, module?.signer);
                if (symbol) setUnknownToken({ symbol, loading: false });
                else setUnknownToken({ ...unknownToken, loading: false });
            })().catch((err) => console.error(err));
        }
    }, [query, module?.signer]);

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
                            onChange={(e) => {
                                handleChange(e);
                                const {
                                    target: { value },
                                } = e;
                                if (value?.startsWith('0x') && value?.length === 42) {
                                    setTimeout(
                                        () => onAssetClick({ target: { innerText: value } }),
                                        200,
                                    );
                                }
                            }}
                            placeholder="Search name or paste address"
                            type="search"
                            className="w-full"
                        />

                        <ul className="h-80 overflow-y-scroll">
                            {(list as ITokenProps[])
                                .sort(alphaTokenSort)
                                .map((el: ITokenProps, i) => (
                                    <li key={`dropdown-item-${el.symbol}-${i}`}>
                                        <button
                                            className={`${dropdownItemClass(
                                                false,
                                            )} transition duration-100 hover:bg-neutral-900`}
                                            onClick={onAssetClick}
                                        >
                                            <Asset
                                                icon={el.logoURI}
                                                symbol={el.symbol}
                                                alt={el.asset}
                                                fontSize="text-lg"
                                                size={30}
                                            />
                                        </button>
                                    </li>
                                ))}
                            {ethers.isAddress(query) && (
                                <li>
                                    <button
                                        className={`${dropdownItemClass(false)} ${
                                            unknownToken.loading ? 'animate-pulse' : ''
                                        }`}
                                        onClick={onAssetClick}
                                    >
                                        <Asset
                                            symbol={unknownToken.symbol}
                                            icon="/img/generic.svg"
                                            alt="Unknown Token"
                                        />
                                    </button>
                                </li>
                            )}
                        </ul>
                    </div>
                </Card>
            </TransitionModal>
        </>
    );
};
