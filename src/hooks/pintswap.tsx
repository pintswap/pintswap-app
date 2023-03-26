import React, { useState, useEffect, FC } from "react";
import { useGlobalContext } from "../stores/global";
import { BASE_URL, EMPTY_TRADE, ITradeProps } from "../utils/common";
import { Pintswap } from "pintswap-sdk";
import { useSigner } from "wagmi";

export const usePintswap = () => {
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState<Error | null>(null);
    const [ peer, setPeer ] = useState<any | undefined>(undefined);
    const { data: signer, isError, isLoading } = useSigner();

    useEffect(() => {
        async function initializePintswap() {
            try {
                setPeer(await Pintswap.initialize({ signer }))
                setLoading(false);
            } catch (error) {
               setError(new Error("failed to initialize Pintswap")) 
            }
        }

        if (typeof peer != undefined) { 
            initializePintswap()
        }
    }, []);

    return [
        peer,
        loading,
        error
    ]
};

type PintswapContextType = {
    peer: any,
    isLoading: boolean,
    error: Error | null
}

export const { Provider, Consumer } = React.createContext<PintswapContextType | null>(null);

export const PintswapContext = (props: any) => {
    const [ peer, isLoading, error ] = usePintswap();
    
    return (
        <Provider value={{ peer, isLoading, error }}>
            {props.children}
        </Provider>
    )
}
