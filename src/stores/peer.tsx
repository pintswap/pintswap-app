import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import PeerId, { JSONPeerId } from 'peer-id';

// Types
export type IPeerStoreProps = {
    peer: JSONPeerId;
};

// Utils
const DEFAULT_PEER = {
  id: '',
  privKey: '',
  pubKey: ''
}

// Context
const PeerContext = createContext<IPeerStoreProps>({
  peer: DEFAULT_PEER
});

// Wrapper
export function PeerStore(props: { children: ReactNode }) {
    const [peer, setPeer] = useState<JSONPeerId>(DEFAULT_PEER);
    // const []

    useEffect(() => {
      const getPeer = async () => {
        const key = 'peerId';
        const localPeerId = localStorage.getItem(key);
        if(localPeerId && localPeerId != null) {
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
                peer
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
