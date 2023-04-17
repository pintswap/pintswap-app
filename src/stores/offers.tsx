import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';
import { IOffer } from '@pintswap/sdk';
import { defer, EMPTY_PEER } from '../utils/common';
import { useGlobalContext } from './global';

// Types
export type IOffersStoreProps = {
  openTrades: Map<string, IOffer>;
  addTrade: (hash: string, { givesToken, givesAmount, getsToken, getsAmount }: IOffer) => void;
  peerTrades: Map<string, IOffer>;
  availableTrades: Map<string, IOffer>;
  setPeerTrades: Dispatch<SetStateAction<Map<string, IOffer>>>;
  setOpenTrades: Dispatch<SetStateAction<Map<string, IOffer>>>;
  setAvailableTrades: Dispatch<SetStateAction<Map<string, IOffer>>>;
};

// Context
const OffersContext = createContext<IOffersStoreProps>({
  openTrades: new Map(),
  peerTrades: new Map(),
  availableTrades: new Map(),
  addTrade(hash, { givesToken, givesAmount, getsToken, getsAmount }) {},
  setOpenTrades: () => {},
  setPeerTrades: () => {},
  setAvailableTrades: () => {},
});

// Peer
(window as any).discoveryDeferred = defer();

const maybeResolveName = async (name: string, pintswap: any) => {
  try {
    return await pintswap.resolveName(name);
  } catch (e) {
    return name;
  }
};

const resolveNames = async (m: any, pintswap: any) => {
  const flattened = [ ...m.entries() ] as any;
  return new Map(await Promise.all(flattened.map(async ([key, orders]: any[]) => {
    return [ await maybeResolveName(key, pintswap), orders ];
  })));
};

// Wrapper
export function OffersStore(props: { children: ReactNode }) {
  const { pintswap } = useGlobalContext();

  const [openTrades, setOpenTrades] = useState<Map<string, IOffer>>(new Map());
  const [peerTrades, setPeerTrades] = useState<Map<string, IOffer>>(new Map());
  const [availableTrades, setAvailableTrades] = useState<Map<string, IOffer>>(new Map());

  const addTrade = (hash: string, tradeProps: IOffer) => {
      setOpenTrades(openTrades.set(hash, tradeProps));
  };

  // Get Active Trades
  useEffect(() => {
      const { module } = pintswap;
      if (module) {
          const listener = () => {
              (async () => {
                if ((pintswap.module?.peers.size as any) > 0)
                    setAvailableTrades(await resolveNames(pintswap.module?.peers as any, pintswap.module as any) as any);
              })().catch((err) => console.error(err));
          };
          module.on('/pubsub/orderbook-update', listener);
          return () => module.removeListener('/pubsub/orderbook-update', listener);
      }
      return () => {};
  }, [pintswap.module]);

  return (
      <OffersContext.Provider
          value={{
              openTrades,
              addTrade,
              peerTrades,
              setPeerTrades,
              setOpenTrades,
              setAvailableTrades,
              availableTrades,
          }}
      >
          {props.children}
      </OffersContext.Provider>
  );
}

// Independent
export function useOffersContext() {
  return useContext(OffersContext);
}
