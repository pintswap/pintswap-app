import { MdExpandMore } from 'react-icons/md';
import { useSearch } from '../../hooks';
import {
    ITokenProps,
    getTokenList,
    dropdownItemClass,
    getSymbol,
    toAddress,
    NETWORKS,
    balanceTokenSort,
    INFTProps,
} from '../../utils';
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react';
import { MdClose } from 'react-icons/md';
import { ethers } from 'ethers6';
import { usePintswapContext, useUserContext } from '../../stores';
import { SmartPrice, Input, Card, TransitionModal, Asset } from '.';

type ISelectNFT = {
    modalOpen: boolean;
    setModalOpen: Dispatch<SetStateAction<boolean>>;
    disabled?: boolean;
    loading?: boolean;
    button?: ReactNode;
    selected?: INFTProps | null;
    setSelected: any;
    items: INFTProps[];
};

export const SelectNFT = ({
    modalOpen,
    setModalOpen,
    disabled,
    button,
    loading,
    items,
    setSelected,
}: ISelectNFT) => {
    const {
        pintswap: { module, chainId },
    } = usePintswapContext();
    const { query, list, handleChange, clearQuery } = useSearch(items);
    const [unknownToken, setUnknownToken] = useState({ symbol: 'Unknown Token', loading: false });

    useEffect(() => {
        if (ethers.isAddress(query)) {
            (async () => {
                setUnknownToken({ ...unknownToken, loading: true });
                const symbol = await getSymbol(query, chainId);
                if (symbol) setUnknownToken({ symbol, loading: false });
                else setUnknownToken({ ...unknownToken, loading: false });
            })().catch((err) => console.error(err));
        }
    }, [query, module?.signer]);

    return (
        <>
            <TransitionModal
                button={
                    button ? (
                        button
                    ) : (
                        <span
                            className={`transition duration-100 flex items-center gap-1 flex-none rounded-full p-1 min-w-max bg-primary hover:bg-primary-hover`}
                        >
                            <span className="pl-2">Select NFT</span>
                            <MdExpandMore />
                        </span>
                    )
                }
                buttonClass="!w-full"
                modalClass={`w-full !max-w-lg`}
                state={disabled ? false : modalOpen}
                setState={disabled ? () => {} : setModalOpen}
            >
                <Card className="w-full border border-neutral-800">
                    <div className="flex flex-col gap-2 lg:gap-3">
                        <div className="flex items-center justify-between">
                            <span>Select NFT</span>
                            <button
                                className="relative -mr-1 p-1 rounded-full bg-neutral-800 transition duration-150 hover:scale-105"
                                onClick={() => setModalOpen(false)}
                            >
                                <MdClose
                                    size={16}
                                    className="text-neutral-400 transition duration-100"
                                />
                            </button>
                        </div>

                        <Input
                            value={query}
                            onChange={(e) => {
                                e.preventDefault();
                                handleChange(e);
                                const {
                                    target: { value },
                                } = e;
                                if (value?.startsWith('0x') && value?.length === 42) {
                                    setTimeout(() => {
                                        console.log({ ...e, target: { innerText: value } });
                                    }, 200);
                                    clearQuery();
                                }
                            }}
                            placeholder="Search name"
                            type="search"
                            className="w-full"
                            autoFocus
                        />

                        <ul className="h-80 overflow-y-scroll">
                            {(list as INFTProps[]).map((el, i) => (
                                <li key={`dropdown-item-${el.token}-${i}`}>
                                    <button
                                        className={`${dropdownItemClass(
                                            false,
                                        )} transition duration-100 hover:bg-neutral-800 flex gap-2 items-center`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setSelected(el);
                                            setTimeout(() => clearQuery(), 200);
                                        }}
                                    >
                                        <div className="flex justify-center items-center w-[30px] h-[30px] overflow-hidden rounded-sm">
                                            <img src={el.image} alt={el.description} />
                                        </div>
                                        <span className="flex flex-col text-lg whitespace-nowrap truncate">
                                            <span>{el.name}</span>
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </Card>
            </TransitionModal>
        </>
    );
};
