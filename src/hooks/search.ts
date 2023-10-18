import { ChangeEvent, useEffect, useState } from 'react';
import { IMarketProps, INFTProps, ITokenProps, getTokenList } from '../utils';
import { IUserDataProps, usePintswapContext } from '../stores';

const isKeyInObjArray = (list: any[], key: string) =>
    list.some((obj) => Object.keys(obj).includes(key));

export const useSearch = (
    list: string[] | ITokenProps[] | IUserDataProps[] | IMarketProps[] | INFTProps[],
) => {
    const {
        pintswap: { chainId },
    } = usePintswapContext();
    const [searchState, setSearchState] = useState({ query: '', list });

    const determineType = () => {
        if (isKeyInObjArray(list, 'symbol')) return 'token';
        else if (isKeyInObjArray(list, 'bio')) return 'user';
        else if (isKeyInObjArray(list, 'offers')) return 'markets';
        else if (isKeyInObjArray(list, 'tokenId')) return 'nft';
        else return 'string';
    };

    const clearQuery = () =>
        determineType() === 'token' && setSearchState({ list: getTokenList(chainId), query: '' });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        let results;
        if (determineType() === 'token') {
            results = getTokenList(chainId).filter((el: ITokenProps) => {
                if (e.target.value === '') return getTokenList(chainId);
                return el.symbol.toLowerCase().includes(e.target.value.toLowerCase());
            });
        } else if (determineType() === 'user' || determineType() === 'nft') {
            results = (list as IUserDataProps[]).filter((el) => {
                if (e.target.value === '') return list;
                return el.name.toLowerCase().includes(e.target.value.toLowerCase());
            });
        } else if (determineType() === 'markets') {
            results = (list as IMarketProps[]).filter((el) => {
                if (e.target.value === '') return list;
                return el.quote.toLowerCase().includes(e.target.value.toLowerCase());
            });
        } else {
            results = (list as string[]).filter((el) => {
                if (e.target.value === '') return searchState.list;
                return el.toLowerCase().includes(e.target.value.toLowerCase());
            });
        }
        setSearchState({
            query: e.target.value,
            list: results,
        });
    };

    useEffect(() => {
        if (determineType() === 'token') {
            setSearchState({ ...searchState, list: getTokenList(chainId) });
        }
    }, [chainId]);

    return {
        query: searchState.query,
        list:
            searchState.list.length === 0 && determineType() !== 'token' ? list : searchState.list,
        handleChange,
        clearQuery,
    };
};
