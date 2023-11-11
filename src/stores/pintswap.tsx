import {
    createContext,
    Dispatch,
    ReactNode,
    SetStateAction,
    useContext,
    useEffect,
    useState,
} from 'react';
import { useSigner, useAccount, useNetwork } from 'wagmi';
import { Pintswap } from '@pintswap/sdk';
import { ethers } from 'ethers6';
import { DEFAULT_CHAINID, defer, savePintswap, TESTING } from '../utils';
import { getNetwork } from '@wagmi/core';
import { toast } from 'react-toastify';
import { useNetworkContext } from './network';
import { useChainModal } from '@rainbow-me/rainbowkit';

// Types
export type IPintswapProps = {
    module: Pintswap | undefined;
    loading: boolean;
    error: boolean;
    chainId: number;
};

export type IPintswapStoreProps = {
    pintswap: IPintswapProps;
    initializePintswapFromSigner: ({ signer }: any) => Promise<void>;
    setPeer?: any;
    setPintswap?: any;
    signIfNecessary: () => Promise<boolean>;
    isIncorrectSigner: () => Promise<boolean>;
    incorrectSigner: boolean;
    setIncorrectSigner: Dispatch<SetStateAction<boolean>>;
};

// Context
const PintswapContext = createContext<IPintswapStoreProps>({
    pintswap: {
        module: undefined,
        loading: true,
        error: false,
        chainId: 1,
    },
    initializePintswapFromSigner: ({ signer, pintswap, setPintswap }) =>
        new Promise((res, rej) => res(signer)),
    signIfNecessary: () => new Promise((res, rej) => res(false)),
    isIncorrectSigner: () => new Promise((res, rej) => res(false)),
    incorrectSigner: true,
    setIncorrectSigner: () => false,
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
    const ps = (await Pintswap.fromPassword({
        signer,
        password: await signer?.getAddress(),
    } as any)) as Pintswap;
    const newPintswap = pintswap.module ? mergeUserData(ps, pintswap.module) : ps;
    newPintswap.logger.info(newPintswap);
    newPintswap.on('peer:discovery', async (peer: any) => {
        (window as any).discoveryDeferred.resolve(peer);
    });
    setPintswap({
        module: newPintswap,
        ...pintswap,
        loading: true,
    });
    await newPintswap.startNode();
    await newPintswap.subscribeOffers();
    setPintswap({
        module: newPintswap,
        ...pintswap,
        loading: false,
    });
}

export const GAS_PRICE_MULTIPLIER = ethers.parseEther('1.8');

export const makeGetGasPrice = (provider: any, multiplier: any) => {
    const getGasPrice = provider.getGasPrice;
    // if (TESTING) console.log('#makeGetGasPrice', getGasPrice);
    return async function (): Promise<ReturnType<typeof ethers.toBigInt>> {
        const gasPrice = ethers.toBigInt(
            ((v) => (v.toHexString ? v.toHexString() : v))(await getGasPrice.call(provider)),
        );
        return (GAS_PRICE_MULTIPLIER * gasPrice) / ethers.parseEther('1');
    };
};

// Wrapper
export function PintswapStore(props: { children: ReactNode }) {
    const { data: signer } = useSigner();
    const { address } = useAccount();
    const { newAddress, newNetwork } = useNetworkContext();
    const localPsUser = localStorage.getItem(`_pintUser${address ? `-${address}` : ''}`);
    const { chain } = useNetwork();
    const { openChainModal } = useChainModal();
    const [incorrectModule, setIncorrectModule] = useState(true);

    const [pintswap, setPintswap] = useState<IPintswapProps>({
        module: undefined,
        loading: true,
        error: false,
        chainId: getNetwork()?.chain?.id || DEFAULT_CHAINID,
    });
    // Determine PintSwap module source
    const determinePsModule = async () => {
        if (!signer) {
            const noWalletInitPs = await Pintswap.initialize({
                awaitReceipts: false,
                signer: new ethers.Wallet(
                    '0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e',
                ).connect(new ethers.InfuraProvider('mainnet')),
            });
            if (TESTING) console.log('noWalletInitPs:', noWalletInitPs);
            return mergeUserData(noWalletInitPs, pintswap.module);
        } else {
            // TODO: fix
            // if (localPsUser !== null) {
            //     const psFromLocal = await Pintswap.fromObject(JSON.parse(localPsUser), signer);
            //     if (TESTING) console.log('psFromLocal:', psFromLocal);
            //     return mergeUserData(psFromLocal, pintswap.module);
            // } else {
            if (signer) {
                const psFromPass = (await Pintswap.fromPassword({
                    signer: signer,
                    password: await signer?.getAddress(),
                } as any)) as Pintswap;
                savePintswap(psFromPass);
                if (TESTING) console.log('psFromPass:', psFromPass);
                return mergeUserData(psFromPass, pintswap.module);
            } else {
                const initPs = await Pintswap.initialize({ awaitReceipts: false, signer });
                savePintswap(initPs);
                if (TESTING) console.log('initPs:', initPs);
                return mergeUserData(initPs, pintswap.module);
            }
            // }
        }
    };

    // Initialize PintSwap Module
    const initialize = async () => {
        const ps: Pintswap = await new Promise((resolve, reject) => {
            (async () => {
                try {
                    const ps = await determinePsModule();
                    setPintswap({ ...pintswap, module: ps });
                    if (ps?.signer?.provider) {
                        ps.signer.provider.getGasPrice = makeGetGasPrice(
                            ps.signer.provider,
                            GAS_PRICE_MULTIPLIER,
                        );
                    }
                    (window as any).ps = ps;
                    ps.on('pintswap/node/status', async (s: number) => {
                        if (TESTING) console.log('Node emitting', s);
                        if (s === 1) {
                            const incorrectSigner = await isIncorrectSigner();
                            setIncorrectModule(!incorrectSigner);
                        }
                    });
                    // Stop exisiting node if there is one started
                    if (pintswap.module?.isStarted() && pintswap.module) {
                        if (TESTING) console.log('Stopped previous node');
                        await pintswap.module.stopNode();
                    }
                    // Start node
                    if (TESTING) console.log('Starting new node');
                    await ps.startNode();
                    // Subscribe to peer
                    ps.on('peer:discovery', async (peer: any) => {
                        (window as any).discoveryDeferred.resolve(peer);
                    });
                    // Subscribe to pubsub
                    await ps.subscribeOffers();
                    resolve(ps);
                } catch (err) {
                    console.warn('#initialize:', err);
                    if (TESTING) console.log('noWalletInitPs:', pintswap.module);
                    (window as any).ps = pintswap.module;
                    if (!pintswap.module?.isStarted() && pintswap.module) {
                        // Start node
                        await pintswap?.module?.startNode();
                        if (TESTING) console.log('Starting new node');
                    }
                    // Subscribe to peer
                    pintswap?.module?.on('peer:discovery', async (peer: any) => {
                        (window as any).discoveryDeferred.resolve(peer);
                    });
                    // Subscribe to pubsub
                    await pintswap.module?.subscribeOffers();
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

    const isIncorrectSigner = async () => {
        const [signerAddress, moduleSignerAddress, moduleAddress] = await Promise.all([
            signer?.getAddress(),
            pintswap.module?.signer?.getAddress(),
            pintswap.module?.addressPromise,
        ]);
        if (moduleSignerAddress === '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199') return true;
        if (moduleSignerAddress !== signerAddress) return true;
        if (moduleAddress !== signerAddress) return true;
        return false;
    };

    const signIfNecessary = async () => {
        try {
            if (incorrectModule) {
                await initialize();
            }
            return true;
        } catch (err) {
            toast.error('Signature required to execute transactions');
            return false;
        }
    };

    // Initialize Default Signer
    useEffect(() => {
        (async () => await initialize())().catch((err) => console.error(err));
    }, []);

    // Initialize Pintswap Obj when wallet connect
    useEffect(() => {
        (async () => signer && incorrectModule && (await initialize()))().catch((err) =>
            console.error(err),
        );
    }, [signer]);

    // If switching account, force pintswap initialization again
    useEffect(() => {
        (async () => newAddress && setIncorrectModule(true))().catch((err) => console.error(err));
    }, [newAddress]);

    // On chain change, reset any toasts
    useEffect(() => toast.dismiss(), [pintswap.chainId]);

    // If incorrect network, prompt switch network
    useEffect(() => {
        if (pintswap.module && address && chain?.unsupported) {
            openChainModal && openChainModal();
        }
    }, [address, pintswap.module]);

    // Assign new network's signer to pintswap's signer
    useEffect(() => {
        if (chain?.id && pintswap.module && signer) {
            pintswap.module.signer = signer;
        }
    }, [newNetwork, signer]);

    return (
        <PintswapContext.Provider
            value={{
                pintswap: {
                    ...pintswap,
                    chainId: getNetwork()?.chain?.id || DEFAULT_CHAINID,
                },
                initializePintswapFromSigner: async ({ signer }: any) =>
                    await initializePintswapFromSigner({ pintswap, setPintswap, signer }),
                setPintswap,
                signIfNecessary,
                isIncorrectSigner,
                incorrectSigner: incorrectModule,
                setIncorrectSigner: setIncorrectModule,
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
