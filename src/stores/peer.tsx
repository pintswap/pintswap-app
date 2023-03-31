import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from 'react';
import PeerId, { JSONPeerId } from 'peer-id';
import { TESTING } from '../utils/common';
import { useGlobalContext } from './global';

// Types
export type IPeerStoreProps = {
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
const PeerContext = createContext<IPeerStoreProps>({
  peer: DEFAULT_PEER,
  peerLoading: true,
});

// Wrapper
export function PeerStore(props: { children: ReactNode }) {
    const [peer, setPeer] = useState<JSONPeerId>(DEFAULT_PEER);
    const [peerLoading, setPeerLoading] = useState(false);

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
    }, [])

    return (
        <PeerContext.Provider
            value={{
                peer,
                peerLoading,
            }}
        >
            {props.children}
        </PeerContext.Provider>
    );
}

// Independent
export function usePeerContext() {
    return useContext(PeerContext);
}
