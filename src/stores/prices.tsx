import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { getEthPrice } from '../api';

const ETH_INTERVAL = 1000 * 60;

// Types
export type IPricesStoreProps = {
    eth: string;
    pricesLoading: boolean;
    pricesError: boolean;
};

const DEFAULT_PRICES: IPricesStoreProps = {
    eth: '0',
    pricesLoading: false,
    pricesError: false,
};

// Context
const PricesContext = createContext(DEFAULT_PRICES);

// Wrapper
export function PricesStore(props: { children: ReactNode }) {
    const [prices, setPrices] = useState(DEFAULT_PRICES);

    function updatePrice(asset: 'eth', usdValue: string) {
        setPrices({ ...prices, [asset]: usdValue });
    }

    useEffect(() => {
        const interval = setInterval(async () => {
            const promises = await Promise.all([getEthPrice()]);
            if (promises) updatePrice('eth', promises[0]);
            else setPrices({ ...prices, pricesError: true });
        }, ETH_INTERVAL);

        return () => clearInterval(interval);
    }, []);

    return <PricesContext.Provider value={prices}>{props.children}</PricesContext.Provider>;
}

// Independent
export function usePricesContext() {
    return useContext(PricesContext);
}
