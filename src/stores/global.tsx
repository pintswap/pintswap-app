import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useSigner } from 'wagmi';
import { Pintswap, IOffer } from 'pintswap-sdk';
import PeerId, { JSONPeerId } from 'peer-id';
import { TESTING } from '../utils/common';

// Types
export type IGlobalStoreProps = {
    openTrades: Map<string, IOffer>;
    addTrade: (hash: string, { givesToken, givesAmount, getsToken, getsAmount }: IOffer) => void;
    pintswap: Pintswap | undefined;
    pintswapLoading: boolean;
    peer: JSONPeerId;
    peerLoading: boolean;
};

// Utils
const DEFAULT_PEER = {
    id: '',
    privKey: '',
    pubKey: ''
  }

// Context
const GlobalContext = createContext<IGlobalStoreProps>({
    openTrades: new Map(),
    addTrade(hash, { givesToken, givesAmount, getsToken, getsAmount }) {},
    pintswap: undefined,
    pintswapLoading: true,
    peer: DEFAULT_PEER,
    peerLoading: true,
});

// Peer
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
    const [peer, setPeer] = useState<JSONPeerId>(DEFAULT_PEER);
    const [peerLoading, setPeerLoading] = useState(true); // TODO: fix

    const addTrade = (hash: string, tradeProps: IOffer) => {
        setOpenTrades(openTrades.set(hash, tradeProps));
    };

    // Initialize Pintswap
    useEffect(() => {
        const initialize = async () => {
            const ps: Pintswap = await new Promise((resolve, reject) => {
                (async () => {
                    try {
                        const ps: Pintswap | Error | any = await Pintswap.initialize({ signer });
                        (window as any).ps = ps;
                        ps.on('pintswap/node/status', (s: any) => {
                            if(TESTING) console.log('Node emitting', s);
                        });
                        await ps.startNode();
                        const discovered = ps.on('peer:discovery', async (peer: any) => {
                            if(TESTING) console.log('discovered peer', peer);
                            setPeerLoading(false);
                            (window as any).discoveryDeferred.resolve(peer);
                        });
                        resolve(ps);
                    } catch (err) {
                        console.error('Initializing error:', err);
                        setPintswapLoading(false);
                        setPeerLoading(false);
                    }
                })().catch(reject);
            });
            if (ps.isStarted()) setPintswap(ps);
            setPintswapLoading(false);
        };
        if (!pintswap && signer) initialize();
    }, [signer]);

    // Find Peer Id
    useEffect(() => {
        const getPeer = async () => {
          const key = 'peerId';
          const localPeerId = localStorage.getItem(key);
          if(localPeerId && localPeerId != null && !TESTING) {
            setPeer(JSON.parse(localPeerId))
          } else {
            const id = await PeerId.create();
            setPeer(id.toJSON())
            localStorage.setItem(key, JSON.stringify(id.toJSON()))
          }
        }
        getPeer();
      }, []);

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
                peer,
                peerLoading
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
