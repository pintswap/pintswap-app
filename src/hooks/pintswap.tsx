import React, { useState, useEffect, FC } from "react";
import { useGlobalContext } from "../stores/global";
import { BASE_URL, EMPTY_TRADE, ITradeProps } from "../utils/common";
import { PintP2P, Pintswap } from "pintswap-sdk";
import { useSigner } from "wagmi";

/*
 * this is probably all wrong, it needs to wait for a signer to be connected then
 * it should initialize pintswap with Pintswap.initialize({ signer: signer })
 * that the Pintswap class extends both Libp2p functionality as well as EventEmitter functionality
 * on top of that it has its own method Pintswap#createTrade that takes I believe an (offer, signer)
 * or something of that nature. just double check
 * you have to have a node running btw for it to connect properly. Im going to add back in the hardhat dev dependencies so that you can run additional hardhat scripts that are useful
 *
 *
 */
export const usePintswap = () => {
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState<Error | null>(null);
    const [ peer, setPeer ] = useState<any | undefined>(undefined);
    const { data: signer } = useSigner();

    useEffect(() => {
        async function initializePintswap() {
            try {
                if(signer) {
                    // const peerId = await PintP2P.peerIdFromSeed(await signer.getAddress())
                    // setPeer(peerId)
                } else {
                    setPeer(
                        null
                    );
                }
                setLoading(false);
            } catch (error) {
               setError(new Error("failed to initialize Pintswap")) 
            }
        }

        if (typeof peer != "undefined") { 
            initializePintswap()
        }
    }, []);

    return {
        peer,
        loading,
        error
    }
};

type PintswapContextType = {
    peer: any,
    loading: boolean,
    error: Error | null
}

export const { Provider, Consumer } = React.createContext<PintswapContextType | null>(null);

export const PintswapContext = (props: any) => {
    const { peer, loading, error } = usePintswap();
    
    return (
        <Provider value={{ peer, loading, error }}>
            {props.children}
        </Provider>
    )
}
