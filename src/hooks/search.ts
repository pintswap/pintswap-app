import { ChangeEvent, useEffect, useState } from "react";
import { ITokenProps, TOKENS } from "../utils/token-list";
import { IUserDataProps } from "../stores";

const isKeyInObjArray = (list: any[], key: string) => list.some(obj => Object.keys(obj).includes(key));

export const useSearch = (list: string[] | ITokenProps[] | IUserDataProps[]) => {
  const [searchState, setSearchState] = useState({ query: '', list });

  const determineType = () => {
    if(isKeyInObjArray(list, 'symbol')) return 'token';
    else if(isKeyInObjArray(list, 'bio')) return 'user';
    else return 'string'
  }
  
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      let results;
      if(determineType() === 'token') {
        results = TOKENS.filter((el: ITokenProps) => {
          if (e.target.value === "") return TOKENS;
          return el.symbol.toLowerCase().includes(e.target.value.toLowerCase())
        })
      } else if(determineType() === 'user') {
        results = (list as IUserDataProps[]).filter((el) => {
          if (e.target.value === "") return list;
          return el.name.toLowerCase().includes(e.target.value.toLowerCase())
        })
      } else {
        results = (list as string[]).filter((el) => {
          if (e.target.value === "") return searchState.list;
          return el.toLowerCase().includes(e.target.value.toLowerCase())
        })
      }
      setSearchState({
        query: e.target.value,
        list: results
      })
  };

  return {
    query: searchState.query,
    list: searchState.list.length === 0 ? list : searchState.list,
    handleChange
  }
}