import { ethers } from 'ethers6';
import { Avatar, DataTable } from '../components';
import { useTrade } from '../hooks/trade';
import { useGlobalContext } from '../stores/global';
import { filterERC20OffersForTicker, toLimitOrder } from '../utils/orderbook';
import { memoize } from 'lodash';
import { useMemo, useEffect, useState } from 'react';
import { useOffersContext } from '../stores';
import { useParams } from 'react-router-dom';
import { isERC721Transfer, isERC20Transfer } from '@pintswap/sdk';
import { Fulfill } from "../components/fulfill";

const columns = [
    {
        name: 'price',
        label: 'Price',
        options: {
            filter: false,
            sort: true,
            sortThirdClickReset: true,
        },
    },
    {
        name: 'amount',
        label: 'Size',
        options: {
            filter: false,
            sort: true,
            sortThirdClickReset: true,
        },
    },
    {
        name: 'sum',
        label: 'Sum',
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
    const { pintswap } = useGlobalContext();
    const { peerTrades } = useOffersContext();
    const { order } = useTrade();
    const { trade, base, multiaddr } = useParams();
    const ticker = `${trade}/${base}`;

    const [bidLimitOrders, setBidLimitOrders] = useState<any[]>([]);
    const [askLimitOrders, setAskLimitOrders] = useState<any[]>([]);

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
                }));
                console.log("MAPPED", mapped)
                setBidLimitOrders(mapped.filter(order => order.type === 'bid'))
                setAskLimitOrders(mapped.filter(order => order.type === 'ask'))
            }
        })().catch((err) => console.error(err));
    }, [pintswap.module, peerTrades, order.multiAddr]);

    const ordersShown = 10;
    return (
        <div className="flex flex-col gap-2 md:gap-3 lg:gap-4">
            <div className="flex items-center justify-between">
                <Avatar peer={multiaddr} withBio withName align="left" type="profile" />
                <span className="text-lg">{ticker}</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-3 lg:gap-4">
                <DataTable 
                    title="Bids"
                    type="bids"
                    columns={columns}
                    data={bidLimitOrders.slice(0, ordersShown)}
                    loading={bidLimitOrders.length === 0}
                    toolbar={false}
                    peer={order.multiAddr}
                    pagination={false}
                    options={{
                        sortOrder: {
                            name: 'price',
                            direction: 'desc'
                        }
                    }}
                />
                <DataTable 
                    title="Asks"
                    type="asks"
                    columns={columns}
                    data={askLimitOrders.slice(0, ordersShown)}
                    loading={askLimitOrders.length === 0}
                    toolbar={false}
                    peer={order.multiAddr}
                    pagination={false}
                    options={{
                        sortOrder: {
                            name: 'price',
                            direction: 'desc'
                        }
                    }}
                />
            </div>
            <Fulfill forTicker={ forTicker } />
        </div>
    );
};
