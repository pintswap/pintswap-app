import { ethers } from 'ethers6';
import { ImSpinner9 } from 'react-icons/im';
import { useNavigate } from 'react-router-dom';
import { Card, CopyClipboard, Table } from '../components';
import { useTrade } from '../hooks/trade';
import { useGlobalContext } from '../stores/global';
import { toLimitOrder } from '../utils/orderbook';
import { capitalCase } from 'change-case';
import { groupBy, memoize } from 'lodash';
import { useEffect, useState } from 'react';
import { useOffersContext } from '../stores';
import { truncate } from '../utils/common';
import { useWindowSize } from '../hooks/window-size';

const groupTickers = (limitOrders: any) => Object.entries(groupBy(limitOrders as any, 'ticker') as any);

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

export const PeerOrderbookView = () => {
    const navigate = useNavigate();
    const { pintswap } = useGlobalContext();
    const { peerTrades } = useOffersContext();
    const { width } = useWindowSize();
    const { order } = useTrade();
    const [limitOrders, setLimitOrders] = useState([]);

    useEffect(() => {
        (async () => {
            if (pintswap.module) {
                const signer = pintswap.module.signer || new ethers.InfuraProvider('mainnet');
                const flattened = toFlattened(peerTrades);
                const limitOrders = (
                    await Promise.all(
                        flattened.map(async (v: any) => await toLimitOrder(v, signer)),
                    )
                ).map((v, i) => ({
                    ...v,
                    hash: flattened[i].hash,
                    peer: flattened[i].peer,
                    multiAddr: flattened[i].multiAddr,
                }));
                setLimitOrders(groupTickers(limitOrders) as any);
            }
        })().catch((err) => console.error(err));
    }, [pintswap.module, peerTrades]);

    return (
        <div className="flex flex-col gap-6">
            <Card 
                header={
                    <div className="w-full flex justify-between">
                        <span>Peer Trades</span>
                        <CopyClipboard value={order.multiAddr || ethers.ZeroAddress} icon={width > 768}>
                            <span className="font-medium">{truncate(order.multiAddr || ethers.ZeroAddress, width > 768 ? 4 : 3)}</span>
                        </CopyClipboard>
                    </div>
                }
                scroll={limitOrders.length > 0}
            >
            {limitOrders.length > 0 ? limitOrders.map(([ pair, orders ], i) => (
                <div key={`open-trades-row-${i}`} className="mt-2 first:mt-0">
                <h2 className="text-indigo-600 mb-2">{ pair }</h2>
                <Table
                    headers={['Hash', 'Type', 'Price', 'Amount']}
                    onClick={(trade: any) => navigate(`/${order.multiAddr}/${trade[0]}`)}
                    items={Array.from(orders, (entry: any) => [
                        entry.hash,
                        capitalCase(entry.type),
                        entry.price,
                        entry.amount,
                    ])}
                />
                </div>
                )) : (
                    <span className="text-center w-full flex flex-col justify-center items-center gap-4">
                        <span className="text-gray-400">Loading peer&apos;s offers...</span>
                        <ImSpinner9 className="animate-spin text-gray-400" size="20px" />
                    </span>
                )}
            </Card>
        </div>
    );
};
