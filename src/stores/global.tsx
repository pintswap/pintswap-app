import { createContext, ReactNode, useContext, useState } from 'react';
import { ITradeProps } from '../utils/common';

// Types
export type IGlobalStoreProps = {
    openTrades: ITradeProps[];
    addTrade: ({ tokenIn, amountIn, tokenOut, amountOut }: ITradeProps) => void;
};

// Context
const GlobalContext = createContext<IGlobalStoreProps>({
    openTrades: [],
    addTrade({ tokenIn, amountIn, tokenOut, amountOut }) {},
});

// Wrapper
export function GlobalStore(props: { children: ReactNode }) {
    const [openTrades, setOpenTrades] = useState<ITradeProps[]>([]);

    const addTrade = (tradeProps: ITradeProps) => {
        const shallow = [...openTrades];
        shallow.push(tradeProps);
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
