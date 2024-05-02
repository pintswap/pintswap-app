import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { getEthPrice, getDegenPrice } from '../api';
import { useOffersContext } from './offers';

const ETH_INTERVAL = 1000 * 30;

// Types
export type IPricesStoreProps = {
    eth: string;
    degen: string;
    pricesLoading: boolean;
    pricesError: boolean;
    formatToUsd: any; // TODO
};

const DEFAULT_PRICES: IPricesStoreProps = {
    eth: '0',
    degen: '0',
    pricesLoading: false,
    pricesError: false,
    formatToUsd: () => {},
};

// Context
const PricesContext = createContext(DEFAULT_PRICES);

// Wrapper
export function PricesStore(props: { children: ReactNode }) {
    const { allOffers } = useOffersContext();
    const [prices, setPrices] = useState(DEFAULT_PRICES);

    function updatePrice(asset: string, usdValue: string) {
        setPrices({ ...prices, [asset]: usdValue });
    }

    function formatToUsd(derivedEth?: string, derivedDegen?: string) {
        if (Number(prices?.eth) > 0) {
            return (Number(prices.eth) * Number(derivedEth)).toString();
        }
        if (Number(prices?.degen) > 0) {
            return (Number(prices.eth) * Number(derivedDegen)).toString();
        }
        return '0';
    }

    useEffect(() => {
        (async () => {
            const firstRun = await getEthPrice();
            const firstDegen = await getDegenPrice();
            updatePrice('eth', firstRun);
            updatePrice('degen', firstDegen);
            const interval = setInterval(async () => {
                const promises = await Promise.all([getEthPrice()]);
                const degenPromises = await Promise.all([getDegenPrice]);
                if (promises.length) updatePrice('eth', promises[0]);
                if (degenPromises.length) updatePrice('degen', promises[0]);
                else setPrices({ ...prices, pricesError: true });
            }, ETH_INTERVAL);

            return () => clearInterval(interval);
        })().catch((err) => console.error(err));
    }, []);

    useEffect(() => {
        (async () => {
            if (prices.eth === '0') {
                const ethPrice = await getEthPrice();
                updatePrice('eth', ethPrice);
            }
            if (prices.degen === '0') {
                const degenPrice = await getDegenPrice();
                updatePrice('degen', degenPrice);
            }
        })().catch((err) => console.error(err));
    }, [allOffers?.erc20?.length]);

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
