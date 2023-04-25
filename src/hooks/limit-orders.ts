import { useState, useMemo, useEffect } from "react";
import { memoize } from 'lodash';
import { isERC721Transfer, isERC20Transfer } from '@pintswap/sdk';
import { useGlobalContext, useOffersContext } from "../stores";
import { ethers } from 'ethers6';
import { toLimitOrder } from '../utils/orderbook';
import { useTrade } from "./trade";

type IUseLimitOrdersProps = 'peer-orderbook' | 'peer-ticker-orderbook';

export const useLimitOrders = (type: IUseLimitOrdersProps) => {
  const { pintswap } = useGlobalContext();
  const { peerTrades } = useOffersContext();
  const { order, loading } = useTrade();

  const [limitOrders, setLimitOrders] = useState<any[]>([]);

  const mapToArray = (v: any) => {
    const it = v.entries();
    const result = [];
    let val;
    while ((val = it.next()) && !val.done) {
        result.push(val.value);
    }
    return result;
};

const toFlattened = memoize((v: any) =>
    mapToArray(v).map(([key, value]: any) => ({
        ...value,
        hash: key,
    })),
);

function groupByType(peerTrades: any) {
    const flattened = toFlattened(peerTrades);
    return {
        erc20: flattened.filter(({ gets, gives }: any) => {
            return isERC20Transfer(gets) && isERC20Transfer(gives);
        }),
        nfts: flattened.filter(({ gets, gives }: any) => {
            return !(isERC20Transfer(gets) && isERC20Transfer(gives));
        }),
    };
}

const sorted = useMemo(() => {
  return groupByType(peerTrades);
}, [peerTrades]);

useEffect(() => {
  (async () => {
      if (pintswap.module) {
          const signer = pintswap.module.signer || new ethers.InfuraProvider('mainnet');
          const { erc20: flattened } = sorted;
          const mapped = (
              await Promise.all(
                  flattened.map(async (v: any) => await toLimitOrder(v, signer)),
              )
          ).map((v, i) => ({
              ...v,
              hash: flattened[i].hash,
              peer: flattened[i].peer,
              multiAddr: flattened[i].multiAddr,
          }));
          setLimitOrders(mapped);
      }
  })().catch((err) => console.error(err));
}, [pintswap.module, peerTrades, order.multiAddr]);

const filteredNfts = useMemo(() => sorted.nfts.filter((v: any) => isERC721Transfer(v.gives)).slice(0, 6), [ sorted.nfts ]);

  return {
    limitOrders,
    filteredNfts,
    sorted
  }
}