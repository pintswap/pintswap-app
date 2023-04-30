import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { formattedPeerName, getPeerData } from '../utils/common';
import { useGlobalContext } from './global';
import { useOffersContext } from './offers';
import { IUserDataProps } from './user';

// Types
export type IPeersStoreProps = {
  peersData: IUserDataProps[];
  peersLoading: boolean;
  peersError: boolean;
};

// Context
const PeersContext = createContext<IPeersStoreProps>({
  peersData: [],
  peersLoading: true,
  peersError: false
});

// Wrapper
export function PeersStore(props: { children: ReactNode }) {
  const { pintswap } = useGlobalContext();
  const { limitOrdersArr } = useOffersContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState<any[]>([]);

  const getAllPeersData = async () => {
    setLoading(true);
      const peerAddresses = Array.from(new Set(limitOrdersArr.map(o => o.peer)));
      try {
        const res = await Promise.all(peerAddresses.map(async (address) => {
          const res = await getPeerData(pintswap, address);
          const baseUrl = `data:image/jpg;base64,`;
          return {
            imgSrc: `${baseUrl}${res.image.toString('base64')}`,
            bio: res.bio,
            name: await formattedPeerName(pintswap, address),
            offers: res.offers
          }
        }))
        setLoading(false)
        setData(res)
      } catch (err) {
        console.error(err);
        setLoading(false);
        setError(true);
      }
  }

  useEffect(() => {
    if(data && data.length > 0) setLoading(false);
    const getter = async () => await getAllPeersData();
    if(limitOrdersArr && limitOrdersArr.length > 0) getter();
  }, [limitOrdersArr])

  return (
      <PeersContext.Provider
          value={{
              peersData: data,
              peersLoading: loading,
              peersError: error
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
