import { ethers } from 'ethers6';
import { Avatar, Card, NFTTable, DataTable, TransitionModal, DropdownMenu, Button } from '../components';
import { useTrade } from '../hooks/trade';
import { useGlobalContext } from '../stores/global';
import { toLimitOrder } from '../utils/orderbook';
import { memoize } from 'lodash';
import { useMemo, useEffect, useState } from 'react';
import { useOffersContext } from '../stores';
import { useLocation } from 'react-router-dom';
import { isERC721Transfer, isERC20Transfer } from '@pintswap/sdk';
import { Tab } from '@headlessui/react';
import { useWindowSize } from '../hooks/window-size';
import { FaChevronDown } from 'react-icons/fa';
import { useDropdown } from '../hooks/dropdown';

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

export const PeerOrderbookView = () => {
    const { width, breakpoints } = useWindowSize();
    const { current, handleCurrentClick, items } = useDropdown([{ text: 'Overview' }, { text: 'Tokens' }, { text: 'NFTs' }]);
    const { pintswap } = useGlobalContext();
    const { peerTrades } = useOffersContext();
    const { order, loading } = useTrade();
    const [limitOrders, setLimitOrders] = useState<any[]>([]);
    const { state } = useLocation();

    const peer = state?.peer ? state.peer : order.multiAddr;

    const TABS = width > breakpoints.md ? ['Token Offers', 'NFT Offers'] : ['Tokens', 'NFTs'];

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
    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <TransitionModal button={<Avatar peer={peer} withBio withName align="left" size={60} type="profile" />}>
                    <Avatar peer={peer} size={300} />
                </TransitionModal>
                <DropdownMenu 
                    customIcon={<span className="flex items-center gap-1">View <FaChevronDown /></span>}
                    items={items}
                    onClick={handleCurrentClick}
                />
            </div>
            
            <Card header={current} scroll={limitOrders.length > 0}>
                <div className={`${current === items[0].text ? 'block' : 'hidden'} flex flex-col gap-3 lg:gap-6`}>
                    <div className="flex flex-col gap-3">
                        <span>NFTs</span>
                        <NFTTable 
                            data={filteredNfts.slice(0, width > breakpoints.lg ? 3 : 2)} 
                            peer={order.multiAddr}
                            loading={loading.allTrades}
                        />
                        {filteredNfts.length > 2 && <Button onClick={() => handleCurrentClick('NFTs')} className="w-fit self-center" type="outline">See All NFTs</Button>}
                    </div>
                    <div className="flex flex-col gap-3">
                        <span>Tokens</span>
                        <DataTable
                            title="Peer Trades"
                            columns={columns}
                            data={limitOrders}
                            loading={loading.allTrades}
                            type="orderbook"
                            peer={order.multiAddr}
                        />
                    </div>
                </div>
                <div className={`${current === items[1].text ? 'block' : 'hidden'} flex flex-col gap-3 lg:gap-6`}>
                    <DataTable
                        title="Peer Trades"
                        columns={columns}
                        data={limitOrders}
                        loading={loading.allTrades}
                        type="orderbook"
                        peer={order.multiAddr}
                    />
                    <Button onClick={() => handleCurrentClick('Overview')} className="w-fit self-center" type="outline">Back to All</Button>
                </div>
                <div className={`${current === items[2].text ? 'block' : 'hidden'} flex flex-col gap-3 lg:gap-6`}>
                    <NFTTable 
                        data={filteredNfts} 
                        peer={order.multiAddr}
                        loading={loading.allTrades}
                    />
                    <Button onClick={() => handleCurrentClick('Overview')} className="w-fit self-center" type="outline">Back to All</Button>
                </div>
            </Card>
        </div>
    );
};
