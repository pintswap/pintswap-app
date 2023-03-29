import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useSigner } from 'wagmi';
import { ITradeProps } from '../utils/common';

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
    const [openTrades, setOpenTrades] = useState<ITradeProps[]>([]);
    const [pintswap, setPintswap] = useState<any>();
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
                console.log("signer:", signer);
                // const ps = await Pintswap.initialize({ signer });
                // await ps.startNode();
                // setPintswap(ps);
                setPintswapLoading(false);
            } catch (err) {
                console.error("Initializing error:", err);
                setPintswapLoading(false)
            }
        }
        if(!pintswap) initialize(); 
    }, [signer])

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
