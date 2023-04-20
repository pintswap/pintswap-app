import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useSigner } from 'wagmi';
import { Pintswap } from '@pintswap/sdk';
import PeerId, { JSONPeerId } from 'peer-id';
import { defer, EMPTY_PEER, TESTING } from '../utils/common';
import { ethers } from 'ethers6';
import { BiDrink, BiHappyAlt, BiDonateBlood, BiRun, BiShapeCircle, BiWind, BiUserPlus } from "react-icons/bi";

// Types
export type IGlobalStoreProps = {
    pintswap: {
        module: Pintswap | undefined;
        loading: boolean;
        error: boolean;
    };
    peer: {
        module: JSONPeerId;
        loading: boolean;
        error: boolean;
    };
    setPeer?: any;
    setPintswap?: any;
    NAV_ITEMS: any[]
};

export type IPintswapProps = {
    module: Pintswap | undefined;
    loading: boolean;
    error: boolean;
};

export type IPeerProps = {
    module: JSONPeerId;
    loading: boolean;
    error: boolean;
};

// Context
const GlobalContext = createContext<IGlobalStoreProps>({
    pintswap: {
        module: undefined,
        loading: true,
        error: false,
    },
    peer: {
        module: EMPTY_PEER,
        loading: true,
        error: false,
    },
    NAV_ITEMS: []
});

// Peer
(window as any).discoveryDeferred = defer();

// Wrapper
export function GlobalStore(props: { children: ReactNode }) {
    const { data: signer } = useSigner();
    const _signer = signer || new ethers.Wallet('0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e')

    const [pintswap, setPintswap] = useState<IPintswapProps>({
        module: undefined,
        loading: true,
        error: false,
    });
    const [peer, setPeer] = useState<IPeerProps>({
        module: EMPTY_PEER,
        loading: true,
        error: false,
    });

    const ICON_SIZE = '20px';
    const NAV_ITEMS = signer ? [
        { text: 'Explore', route: '/explore', disabled: false, icon: <BiDrink size={ICON_SIZE} /> },
        { text: 'Pairs', route: '/pairs', disabled: false, icon: <BiDonateBlood size={ICON_SIZE} /> },
        { text: 'Peers', route: '/peers', disabled: false, icon: <BiShapeCircle size={ICON_SIZE} /> },
        { text: 'Create', route: '/create', disabled: false, icon: <BiRun size={ICON_SIZE} /> },
        { text: 'Fulfill', route: '/fulfill', disabled: false, icon: <BiWind size={ICON_SIZE} /> },
        { text: 'Account', route: '/account', disabled: false, icon: <BiHappyAlt size={ICON_SIZE} /> },
    ] : [
        { text: 'Explore', route: '/explore', disabled: false, icon: <BiDrink size={ICON_SIZE} /> },
        { text: 'Pairs', route: '/pairs', disabled: false, icon: <BiDonateBlood size={ICON_SIZE} /> },
        { text: 'Peers', route: '/peers', disabled: false, icon: <BiShapeCircle size={ICON_SIZE} /> },
    ]

    // Initialize Pintswap
    useEffect(() => {
        const initialize = async () => {
            const ps: Pintswap = await new Promise((resolve, reject) => {
                (async () => {
                    try {
                        const ps =
                            typeof localStorage.getItem('_pintUser') === 'string'
                                ? await Pintswap.fromObject(
                                      JSON.parse(localStorage.getItem('_pintUser') as string),
                                      _signer,
                                  )
                                : await Pintswap.initialize({ awaitReceipts: false, signer: _signer });
                        (window as any).ps = ps;
                        ps.on('pintswap/node/status', (s: any) => {
                            if (TESTING) console.log('Node emitting', s);
                        });
                        // Start node
                        await ps.startNode();
                        // Subscribe to peer
                        ps.on('peer:discovery', async (peer: any) => {
                            if (TESTING) console.log('Discovered peer:', peer);
                            (window as any).discoveryDeferred.resolve(peer);
                        });
                        // Subscribe to pubsub
                        await ps.subscribeOffers();
                        resolve(ps);
                    } catch (err) {
                        console.error('Initializing error:', err);
                        setPintswap({ ...pintswap, loading: false });
                        setPeer({ ...peer, loading: false });
                    }
                })().catch(reject);
            });
            if (ps.isStarted()) {
                setPintswap({ ...pintswap, module: ps, loading: false });
            } else {
                setPintswap({ ...pintswap, loading: false });
            }
        };
        if (!pintswap.module && _signer) initialize();
    }, [signer]);

    // Find Peer Id
    useEffect(() => {
        const getPeer = async () => {
            const key = 'peerId';
            const localPeerId = localStorage.getItem(key);
            if (localPeerId && localPeerId != null && !TESTING) {
                setPeer({ ...peer, module: JSON.parse(localPeerId) });
            } else {
                const id = await PeerId.create();
                setPeer({ ...peer, module: id.toJSON() });
                localStorage.setItem(key, JSON.stringify(id.toJSON()));
            }
        };
        getPeer();
    }, []);

    return (
        <GlobalContext.Provider
            value={{
                pintswap,
                peer,
                setPeer,
                setPintswap,
                NAV_ITEMS
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
