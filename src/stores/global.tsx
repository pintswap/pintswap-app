import { createContext, ReactNode, useContext, useState } from 'react';
import { ITradeProps } from '../utils/common';

// Types
export type IGlobalStoreProps = {
    openTrades: ITradeProps[];
    addTrade: (tokenA: string, amountA: string, tokenB: string, amountB: string) => void;
};

// Context
const GlobalContext = createContext<IGlobalStoreProps>({
    openTrades: [],
    addTrade(tokenA, amountA, tokenB, amountB) {},
});

// Wrapper
export function GlobalStore(props: { children: ReactNode }) {
    const [openTrades, setOpenTrades] = useState<ITradeProps[]>([]);

    const addTrade = (tokenA: string, amountA: string, tokenB: string, amountB: string) => {
        const shallow = [...openTrades];
        shallow.push({
            'Input Token': tokenA,
            'Input Amount': amountA,
            'Output Token': tokenB,
            'Output Amount': amountB,
        });
        setOpenTrades(shallow);
    };

    return (
        <GlobalContext.Provider
            value={{
                openTrades,
                addTrade,
            }}
        >
            {props.children}
        </GlobalContext.Provider>
    );
}

// Independent
export function useGlobalContext() {
    return useContext(GlobalContext);
}
