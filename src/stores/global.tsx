import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useSigner } from 'wagmi';
import { ITradeProps } from '../utils/common';
import { Pintswap } from 'pintswap-sdk';

// Types
export type IGlobalStoreProps = {
    openTrades: ITradeProps[];
    addTrade: ({ tokenIn, amountIn, tokenOut, amountOut }: ITradeProps) => void;
    pintswap: any;
    pintswapLoading: boolean;
};

// Context
const GlobalContext = createContext<IGlobalStoreProps>({
    openTrades: [],
    addTrade({ tokenIn, amountIn, tokenOut, amountOut }) {},
    pintswap: {},
    pintswapLoading: true
});

// Wrapper
export function GlobalStore(props: { children: ReactNode }) {
    const [openTrades, setOpenTrades] = useState<any>([]);
    const [pintswap, setPintswap] = useState<Pintswap>();
    const [pintswapLoading, setPintswapLoading] = useState(true);
    const { data: signer } = useSigner();

    const addTrade = (tradeProps: ITradeProps) => {
        const shallow = [...openTrades];
        shallow.push(tradeProps);
        setOpenTrades(shallow);
    };

    // Initialize Pintswap
    useEffect(() => {
        const initialize = async () => {
            try {
                const ps: Pintswap | Error = await Pintswap.initialize({ signer });
                const res =await ps.startNode();
                if(ps.isStarted()) setPintswap(ps);
                setPintswapLoading(false);
            } catch (err) {
                console.error("Initializing error:", err);
                setPintswapLoading(false)
            }
        }
        if(!pintswap && signer) initialize(); 
    }, [signer]);

    // Get Active Trades
    useEffect(() => {
        if(pintswap) setOpenTrades(pintswap.offers)
    }, [pintswap])

    return (
        <GlobalContext.Provider
            value={{
                openTrades,
                addTrade,
                pintswap,
                pintswapLoading
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
