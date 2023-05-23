import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useSigner } from 'wagmi';
import { Pintswap } from '@pintswap/sdk';
import { defer, TESTING } from '../utils/common';
import { ethers } from 'ethers6';

// Types
export type IPintswapProps = {
    module: Pintswap | undefined;
    loading: boolean;
    error: boolean;
};

export type IPintswapStoreProps = {
    pintswap: IPintswapProps;
    setPeer?: any;
    setPintswap?: any;
};

// Context
const PintswapContext = createContext<IPintswapStoreProps>({
    pintswap: {
        module: undefined,
        loading: true,
        error: false,
    },
});

// Utils
(window as any).discoveryDeferred = defer();

function mergeUserData(a: any, b: any): typeof a {
    if (b && b.userData) a.userData = b.userData;
    return a;
}

// Wrapper
const ln = (v: any, label: string) => ((console.log(label, v)), v);
export function PintswapStore(props: { children: ReactNode }) {
    const { data: signer } = useSigner();
    const _signer = signer || new ethers.Wallet('0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e');
    const localPsUser = localStorage.getItem('_pintUser');

    const [pintswap, setPintswap] = useState<IPintswapProps>({
        module: undefined,
        loading: true,
        error: false,
    });

    const determinePsModule = async () => {
        if(typeof localPsUser === 'string') {
            const psFromLocal = await Pintswap.fromObject(JSON.parse(localPsUser), ln(_signer, "signer"));
            console.log("psFromLocal:", psFromLocal)
            return psFromLocal;
        } else {
            if(signer) {
                const psFromPass = await Pintswap.fromPassword({ signer: ln(signer, "signer"), password: await signer.getAddress() } as any) as Pintswap;
                console.log("psFromPass:", psFromPass);
                return mergeUserData(psFromPass, pintswap.module);
            } else {
                const initPs = await Pintswap.initialize({ awaitReceipts: false, signer: ln(_signer, "signer") });
                console.log("initPs:", initPs)
                return initPs;
            }
        }
    }

    // Initialize Pintswap
    useEffect(() => {
        const initialize = async () => {
            const ps: Pintswap = await new Promise((resolve, reject) => {
                (async () => {
                    try {
                        const ps = await determinePsModule();
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

    useEffect(() => {
      if (pintswap.module && pintswap.module.signer && (!pintswap.module.signer.provider || (signer.address || '').toLowerCase() === '0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199'.toLowerCase()) && signer) pintswap.module.signer = signer;
    }, [ signer, pintswap ]);

    return (
        <PintswapContext.Provider
            value={{
                pintswap,
                setPintswap,
            }}
        >
            {props.children}
        </PintswapContext.Provider>
    );
}

// Independent
export function usePintswapContext() {
    return useContext(PintswapContext);
}
