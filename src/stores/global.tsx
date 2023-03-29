import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useSigner } from 'wagmi';
import { Pintswap, IOffer } from 'pintswap-sdk';

// Types
export type IGlobalStoreProps = {
    openTrades: Map<string, IOffer>;
    addTrade: (hash: string, { givesToken, givesAmount, getsToken, getsAmount }: IOffer) => void;
    pintswap: any;
    pintswapLoading: boolean;
};

// Context
const GlobalContext = createContext<IGlobalStoreProps>({
    openTrades: new Map(),
    addTrade(hash, { givesToken, givesAmount, getsToken, getsAmount }) {},
    pintswap: {},
    pintswapLoading: true
});

// Wrapper
export function GlobalStore(props: { children: ReactNode }) {
    const [openTrades, setOpenTrades] = useState<Map<string, IOffer>>(new Map());
    const [pintswap, setPintswap] = useState<Pintswap>();
    const [pintswapLoading, setPintswapLoading] = useState(true);
    const { data: signer } = useSigner();

    const addTrade = (hash: string, tradeProps: IOffer) => {
        setOpenTrades(openTrades.set(hash, tradeProps));
    };

    // Initialize Pintswap
    useEffect(() => {
        const initialize = async () => {
            const ps: Pintswap = await new Promise(async (resolve) => { // eslint-disable-line
                try {
                    const ps: Pintswap | Error | any = await Pintswap.initialize({ signer });
                    await ps.startNode();
                    resolve(ps)
                } catch (err) {
                    console.error("Initializing error:", err);
                    setPintswapLoading(false)
                }
            })
            if(ps.isStarted()) setPintswap(ps);
            setPintswapLoading(false);
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
