import { ethers } from 'ethers6';
import { Avatar, Card, DataTable } from '../components';
import { useTrade } from '../hooks/trade';
import { useGlobalContext } from '../stores/global';
import { filterERC20OffersForTicker, toLimitOrder } from '../utils/orderbook';
import { memoize } from 'lodash';
import { useMemo, useEffect, useState } from 'react';
import { useOffersContext } from '../stores';
import { useParams, useLocation } from 'react-router-dom';
import { isERC721Transfer, isERC20Transfer } from '@pintswap/sdk';
import { Tab } from '@headlessui/react';
import { useWindowSize } from '../hooks/window-size';
import { Fulfill } from "../components/fulfill";

const columns = [
    {
        name: 'hash',
        label: 'Hash',
        options: {
            filter: false,
            sort: true,
            sortThirdClickReset: true,
        },
    },
    {
        name: 'ticker',
        label: 'Pair',
        options: {
            filter: true,
            sort: true,
            sortThirdClickReset: true,
        },
    },
    {
        name: 'type',
        label: 'Type',
        options: {
            filter: true,
            sort: true,
            sortThirdClickReset: true,
        },
    },
    {
        name: 'amount',
        label: 'Amount',
        options: {
            filter: false,
            sort: true,
            sortThirdClickReset: true,
        },
    },
    {
        name: 'price',
        label: 'Price',
        options: {
            filter: false,
            sort: true,
            sortThirdClickReset: true,
        },
    },
];

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

export const PeerTickerOrderbookView = () => {
    const { width, breakpoints } = useWindowSize();
    const { pintswap } = useGlobalContext();
    const { peerTrades } = useOffersContext();
    const { order } = useTrade();
    const [limitOrders, setLimitOrders] = useState<any[]>([]);
    const { state } = useLocation();
    const { trade, base, multiaddr } = useParams();
    const ticker = `${trade}/${base}`;

    const peer = state?.peer ? state.peer : order.multiAddr;

    const TABS = width > breakpoints.md ? ['Token Offers', 'NFT Offers'] : ['Tokens', 'NFTs'];

    const sorted = useMemo(() => {
        return groupByType(peerTrades);
    }, [peerTrades]);
    const forTicker = useMemo(() => {
      return Object.fromEntries(['ask', 'bid'].map((type) => [ type, filterERC20OffersForTicker(sorted.erc20 || [], ticker, type as any) ]));
    }, [ sorted ] );

    useEffect(() => {
        (async () => {
            if (pintswap.module) {
                const signer = pintswap.module.signer || new ethers.InfuraProvider('mainnet');
                const flattened = forTicker.bid.concat(forTicker.ask);
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

    const filteredNfts = useMemo(
        () => sorted.nfts.filter((v: any) => isERC721Transfer(v.gives)).slice(0, 6),
        [sorted.nfts],
    );
    return (
        <div className="flex flex-col gap-6">
            <Avatar peer={multiaddr} withBio withName align="left" size={150} type="profile" />
            <DataTable
                    title="Peer Trades"
                    columns={columns}
                    data={limitOrders}
                    loading={limitOrders.length === 0}
                    type="orderbook"
                    peer={order.multiAddr}
                />
            <Fulfill forTicker={ forTicker } />
        </div>
    );
};