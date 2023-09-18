import { MdExpandMore } from 'react-icons/md';
import { Asset } from './asset';
import { TransitionModal } from './modal';
import { Card } from './card';
import { Input } from './input';
import { useSearch } from '../hooks';
import {
    ITokenProps,
    getTokenList,
    alphaTokenSort,
    dropdownItemClass,
    getSymbol,
    toAddress,
    EXPLORER_URLS,
    balanceTokenSort,
} from '../utils';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { MdClose } from 'react-icons/md';
import { ethers } from 'ethers6';
import { usePintswapContext, useUserContext } from '../stores';
import { TooltipWrapper } from './tooltip';
import { matchWithUserBalances } from '../api';
import { SmartPrice } from './smart-price';

type ISelectCoin = {
    asset?: string;
    onAssetClick?: any;
    modalOpen: boolean;
    setModalOpen: Dispatch<SetStateAction<boolean>>;
    disabled?: boolean;
    type?: 'swap' | 'fulfill';
};

export const SelectCoin = ({
    asset,
    onAssetClick,
    modalOpen,
    setModalOpen,
    disabled,
    type = 'swap',
}: ISelectCoin) => {
    const {
        pintswap: { module, chainId },
    } = usePintswapContext();
    const { tokenHoldings } = useUserContext();
    const { query, list, handleChange, clearQuery } = useSearch(getTokenList(chainId));
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

    const memoizedList = useMemo(() => {
        return (list as ITokenProps[]).map((el) => ({
            ...el,
            balance: matchWithUserBalances(el.address, tokenHoldings),
        }));
    }, [tokenHoldings, list]);

    return (
        <>
            <TransitionModal
                button={
                    <span
                        className={`transition duration-100 flex items-center gap-1 flex-none rounded-full p-1 min-w-max ${
                            asset || type === 'fulfill'
                                ? `bg-neutral-600 ${
                                      disabled && type !== 'fulfill' ? '' : 'hover:bg-neutral-500'
                                  }`
                                : `bg-indigo-600  ${disabled ? '' : 'hover:bg-indigo-hover'}`
                        } ${type === 'fulfill' ? 'pr-2.5' : ''}`}
                    >
                        {asset ? (
                            type === 'fulfill' ? (
                                <TooltipWrapper
                                    text={toAddress(asset, chainId)}
                                    id={`select-coin-${type}-${asset}-${chainId}`}
                                >
                                    <a
                                        href={`${EXPLORER_URLS[chainId]}/token/${toAddress(
                                            asset,
                                            chainId,
                                        )}`}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <Asset symbol={asset} />
                                    </a>
                                </TooltipWrapper>
                            ) : (
                                <Asset symbol={asset} />
                            )
                        ) : type === 'fulfill' ? (
                            <span className="pl-2">Loading</span>
                        ) : (
                            <span className="pl-2 flex items-center">
                                Select<span className="hidden sm:block ml-[5px]">a token</span>
                            </span>
                        )}
                        {type !== 'fulfill' && <MdExpandMore />}
                    </span>
                }
                modalClass={`w-full !max-w-xl`}
                state={disabled ? false : modalOpen}
                setState={disabled ? () => {} : setModalOpen}
            >
                <Card className="w-full border border-neutral-800">
                    <div className="flex flex-col gap-2 lg:gap-3">
                        <div className="flex items-center justify-between">
                            <span>Select a token</span>
                            <button
                                className="p-1 relative -mt-0.5 -mr-2"
                                onClick={() => setModalOpen(false)}
                            >
                                <MdClose
                                    size={24}
                                    className="hover:text-neutral-300 transition duration-100"
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
                                        onAssetClick({ ...e, target: { innerText: value } });
                                    }, 200);
                                    clearQuery();
                                }
                            }}
                            placeholder="Search name or paste address"
                            type="search"
                            className="w-full"
                            autoFocus
                        />

                        <ul className="h-80 overflow-y-scroll">
                            {memoizedList.sort(balanceTokenSort).map((el: ITokenProps, i) => (
                                <li key={`dropdown-item-${el.symbol}-${i}`}>
                                    <button
                                        className={`${dropdownItemClass(
                                            false,
                                        )} transition duration-100 hover:bg-neutral-900 flex justify-between items-center`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onAssetClick({
                                                ...e,
                                                target: { innerText: el.symbol },
                                            });
                                            setTimeout(() => clearQuery(), 200);
                                        }}
                                    >
                                        <Asset
                                            icon={el.logoURI}
                                            symbol={el.symbol}
                                            alt={el.name}
                                            fontSize="text-lg"
                                            size={30}
                                        />
                                        <span className="text-sm">
                                            <SmartPrice price={el.balance || '0'} />
                                        </span>
                                    </button>
                                </li>
                            ))}
                            {ethers.isAddress(query) && (
                                <li>
                                    <button
                                        className={`${dropdownItemClass(false)} ${
                                            unknownToken.loading ? 'animate-pulse' : ''
                                        }`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onAssetClick(e);
                                            setTimeout(() => clearQuery(), 200);
                                        }}
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
