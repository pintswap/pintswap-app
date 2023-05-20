import { useMemo, createContext, ReactNode, useContext, useEffect, useState } from 'react';
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
    initializePintswapFromSigner?: any;
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

export async function initializePintswapFromSigner({ signer, pintswap, setPintswap }: any) {
  await (window as any).discoveryDeferred.promise;
  if (pintswap.module) await pintswap.module.stopNode();
  const metamask = getMetamask(signer);
  if (metamask) await metamask.request({
    method: 'wallet_requestPermissions',
    params: [{ eth_accounts: {} }]
  });
  const ps = await Pintswap.fromPassword({ signer, password: await signer.getAddress() } as any) as Pintswap;
  const newPintswap = pintswap.module ? mergeUserData(ps, pintswap.module) : ps;
  newPintswap.logger.info(newPintswap);
  (window as any).discoveryDeferred = defer();
  newPintswap.on('peer:discovery', async (peer: any) => {
    if (TESTING) console.log('Discovered peer:', peer);
    (window as any).discoveryDeferred.resolve(peer);
  });
  setPintswap({
     module: newPintswap,
     ...pintswap,
     loading: true
  });
  await newPintswap.startNode();
  await newPintswap.subscribeOffers();
  setPintswap({
    module: newPintswap,
    ...pintswap,
    loading: false
  });
}
  
const getMetamask = (signer: any) => signer && signer.provider && signer.provider.provider && signer.provider.provider.isMetaMask && signer.provider.provider;

// Wrapper
export function PintswapStore(props: { children: ReactNode }) {
    const { data: signer }: any = useSigner();
    const _signer = signer || new ethers.Wallet('0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e');
    const localPsUser = localStorage.getItem('_pintUser');

    const [pintswap, setPintswap] = useState<IPintswapProps>({
        module: undefined,
        loading: true,
        error: false,
    });
    const metamask = useMemo(() => getMetamask(signer), [ signer ]);
    useEffect(() => {
      if (metamask) {
        const listener = async () => {
          await initializePintswapFromSigner({ signer, pintswap, setPintswap });
        };
        metamask.on('accountsChanged', listener);
        return () => metamask.removeListener('accountsChanged', listener);
      }
    }, [ signer ]);

    const determinePsModule = async () => {
        if(typeof localPsUser === 'string') {
            const psFromLocal = await Pintswap.fromObject(JSON.parse(localPsUser), _signer);
            console.log("psFromLocal:", psFromLocal)
            return psFromLocal;
        } else {
            if(signer) {
                const psFromPass = await Pintswap.fromPassword({ signer: signer, password: await signer.getAddress() } as any) as Pintswap;
                console.log("psFromPass:", psFromPass);
                return mergeUserData(psFromPass, pintswap.module);
            } else {
                const initPs = await Pintswap.initialize({ awaitReceipts: false, signer: _signer });
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
      if (pintswap.module && pintswap.module.signer && !pintswap.module.signer.provider && signer) pintswap.module.signer = signer;
    }, [ signer, pintswap ]);

    return (
        <PintswapContext.Provider
            value={{
                pintswap,
                initializePintswapFromSigner: async ({ signer }: any) => await initializePintswapFromSigner({ pintswap, setPintswap, signer }),
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
