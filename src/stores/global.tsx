import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useSigner } from 'wagmi';
import { Pintswap, IOffer } from 'pintswap-sdk';
import PeerId from 'peer-id';
import { useLocation } from 'react-router-dom';

// Types
export type IGlobalStoreProps = {
    openTrades: Map<string, IOffer>;
    addTrade: (hash: string, { givesToken, givesAmount, getsToken, getsAmount }: IOffer) => void;
    pintswap: Pintswap | undefined;
    pintswapLoading: boolean;
};

// Context
const GlobalContext = createContext<IGlobalStoreProps>({
    openTrades: new Map(),
    addTrade(hash, { givesToken, givesAmount, getsToken, getsAmount }) {},
    pintswap: undefined,
    pintswapLoading: true,
});

const defer = () => {
    let resolve,
        reject,
        promise = new Promise((_resolve, _reject) => {
            resolve = _resolve;
            reject = _reject;
        });
    return {
        resolve,
        reject,
        promise,
    };
};

(window as any).discoveryDeferred = defer();

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
            const ps: Pintswap = await new Promise((resolve, reject) => {
                (async () => {
                    // eslint-disable-line
                    try {
                        const ps: Pintswap | Error | any = await Pintswap.initialize({ signer });
                        (window as any).ps = ps;
                        ps.on('pintswap/node/status', (s: any) => {
                            console.log('emit', s);
                        });
                        await ps.startNode();
                        ps.on('peer:discovery', (peer: any) => {
                            console.log('discovered peer', peer);
                            (window as any).discoveryDeferred.resolve(peer);
                        });
                        resolve(ps);
                    } catch (err) {
                        console.error('Initializing error:', err);
                        setPintswapLoading(false);
                    }
                })().catch(reject);
            });
            if (ps.isStarted()) setPintswap(ps);
            setPintswapLoading(false);
        };
        if (!pintswap && signer) initialize();
    }, [signer]);

    // Get Active Trades
    useEffect(() => {
        if (pintswap) setOpenTrades(pintswap.offers);
    }, [pintswap]);

    return (
        <GlobalContext.Provider
            value={{
                openTrades,
                addTrade,
                pintswap,
                pintswapLoading,
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
