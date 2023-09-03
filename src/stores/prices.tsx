import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { getEthPrice } from '../api';

const ETH_INTERVAL = 1000 * 30;

// Types
export type IPricesStoreProps = {
    eth: string;
    pricesLoading: boolean;
    pricesError: boolean;
    formatToUsd: any; // TODO
};

const DEFAULT_PRICES: IPricesStoreProps = {
    eth: '0',
    pricesLoading: false,
    pricesError: false,
    formatToUsd: () => {},
};

// Context
const PricesContext = createContext(DEFAULT_PRICES);

// Wrapper
export function PricesStore(props: { children: ReactNode }) {
    const [prices, setPrices] = useState(DEFAULT_PRICES);

    function updatePrice(asset: 'eth', usdValue: string) {
        setPrices({ ...prices, [asset]: usdValue });
    }

    function formatToUsd(derivedEth?: string) {
        if (Number(prices?.eth) > 0) {
            return (Number(prices.eth) * Number(derivedEth)).toString();
        }
        return '0';
    }

    useEffect(() => {
        (async () => {
            const firstRun = await getEthPrice();
            updatePrice('eth', firstRun);
            const interval = setInterval(async () => {
                const promises = await Promise.all([getEthPrice()]);
                if (promises.length) updatePrice('eth', promises[0]);
                else setPrices({ ...prices, pricesError: true });
            }, ETH_INTERVAL);

            return () => clearInterval(interval);
        })().catch((err) => console.error(err));
    }, []);

    return (
        <PricesContext.Provider value={{ ...prices, formatToUsd }}>
            {props.children}
        </PricesContext.Provider>
    );
}

// Independent
export function usePricesContext() {
    return useContext(PricesContext);
}
