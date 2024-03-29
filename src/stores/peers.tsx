import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { getFormattedPeer } from '../utils/peer';
import { usePintswapContext } from './pintswap';
import { useOffersContext } from './offers';
import { IUserDataProps } from './user';
import { useNetworkContext } from './network';

// Types
export type IPeersStoreProps = {
    peersData: IUserDataProps[];
    peersLoading: boolean;
    peersError: boolean;
    updatePeersData: (peer: IUserDataProps) => void;
};

// Context
const PeersContext = createContext<IPeersStoreProps>({
    peersData: [],
    peersLoading: true,
    peersError: false,
    updatePeersData: () => {},
});

// Wrapper
export function PeersStore(props: { children: ReactNode }) {
    const { pintswap } = usePintswapContext();
    const { network } = useNetworkContext();
    const { offersByChain, allOffers, isLoading } = useOffersContext();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [data, setData] = useState<IUserDataProps[]>([]);

    const updatePeersData = (peer: IUserDataProps) => {
        setData((prevData) =>
            prevData.map((el, i) =>
                el.name === peer.name || el.address === peer.address ? peer : el,
            ),
        );
    };

    const getAllPeersData = async () => {
        setLoading(true);
        const peerAddresses = Array.from(
            new Set([...offersByChain.erc20, ...offersByChain.nft].map((o) => o.peer)),
        );
        try {
            const allPeersData = await Promise.all(
                peerAddresses.map(
                    async (address) => await getFormattedPeer(pintswap, address, 'minimal'),
                ),
            );
            setLoading(false);
            setData(allPeersData);
        } catch (err) {
            console.error(err);
            setLoading(false);
            setError(true);
        }
    };

    useEffect(() => {
        if (data && data.length > 0) setLoading(false);
        const getter = async () => await getAllPeersData();
        if (allOffers.erc20 && allOffers.erc20.length > 0) getter();
        else if (!isLoading) setLoading(false);
    }, [offersByChain.erc20, pintswap.chainId, network?.id]);

    return (
        <PeersContext.Provider
            value={{
                peersData: data,
                peersLoading: loading,
                peersError: error,
                updatePeersData,
            }}
        >
            {props.children}
        </PeersContext.Provider>
    );
}

// Independent
export function usePeersContext() {
    return useContext(PeersContext);
}
