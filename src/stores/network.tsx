import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { Chain, ConnectorData, useAccount, useNetwork } from 'wagmi';

// Types
export type INetworkStoreProps = {
    network?: Chain;
    address?: string;
    newNetwork: boolean;
    newAddress: boolean;
};

const DEFAULT_WALLET: INetworkStoreProps = {
    address: '',
    newNetwork: false,
    newAddress: false,
};

const DEFAULT_TIMER = 200;

// Context
const NetworkContext = createContext(DEFAULT_WALLET);

// Wrapper
export function NetworkStore(props: { children: ReactNode }) {
    const { chain } = useNetwork();
    const { connector: activeConnector, address } = useAccount();
    const [network, setNetwork] = useState(chain);
    const [meta, setMeta] = useState({ newNetwork: false, newAddress: false });

    const timerRef = useRef(null as any);

    useEffect(() => {
        if (chain) {
            setNetwork(chain);
        }
    }, [chain?.id]);

    useEffect(() => {
        const handleConnectorUpdate = ({ account, chain }: ConnectorData) => {
            clearTimeout(timerRef.current);

            if (account) {
                console.log('new account', account);
                setMeta({ ...meta, newAddress: true });
                timerRef.current = setTimeout(() => {
                    setMeta({ ...meta, newAddress: false });
                }, DEFAULT_TIMER);
            } else if (chain) {
                console.log('new chain', chain);
                setMeta({ ...meta, newNetwork: true });
                timerRef.current = setTimeout(() => {
                    setMeta({ ...meta, newNetwork: false });
                }, DEFAULT_TIMER);
            }
        };

        activeConnector && activeConnector.on('change', handleConnectorUpdate);

        return () => activeConnector?.off('change', handleConnectorUpdate) as any;
    }, [activeConnector]);

    useEffect(() => {
        return () => clearTimeout(timerRef.current);
    }, []);

    return (
        <NetworkContext.Provider
            value={{
                address: address as string | undefined,
                network,
                newNetwork: meta.newNetwork,
                newAddress: meta.newAddress,
            }}
        >
            {props.children}
        </NetworkContext.Provider>
    );
}

// Independent
export function useNetworkContext() {
    return useContext(NetworkContext);
}
