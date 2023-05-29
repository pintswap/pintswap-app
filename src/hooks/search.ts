import { ChangeEvent, useEffect, useState } from "react";
import { ITokenProps, TOKENS } from "../utils/token-list";

export const useSearch = (list: string[] | ITokenProps[]) => {
  const isToken = list === TOKENS ? true : false;
  const [searchState, setSearchState] = useState({ query: '', list });
  
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      let results;
      if(isToken) {
        results = TOKENS.filter((el: ITokenProps) => {
          if (e.target.value === "") return TOKENS;
          return el.symbol.toLowerCase().includes(e.target.value.toLowerCase())
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