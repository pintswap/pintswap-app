import { Avatar, Card, DataTable, DropdownMenu, Button, Header, NFTTable } from '../components';
import { useTrade } from '../hooks/trade';
import { useLocation, useParams } from 'react-router-dom';
import { useWindowSize } from '../hooks/window-size';
import { FaChevronDown } from 'react-icons/fa';
import { useDropdown } from '../hooks/dropdown';
import { useLimitOrders } from '../hooks';
import { useEffect, useState } from 'react';
import { useOffersContext, usePintswapContext } from '../stores';
import { groupBy } from 'lodash';
import { resolveName } from '../hooks/trade';
import { bestPrices } from '../utils';
import { Tab } from '@headlessui/react';

const columns = [
    {
        name: 'ticker',
        label: 'Ticker',
        options: {
            filter: false,
            sort: true,
            sortThirdClickReset: true,
        },
    },
    {
        name: 'bid',
        label: 'Bid',
        options: {
            filter: false,
            sort: true,
            sortThirdClickReset: true,
        },
    },
    {
        name: 'ask',
        label: 'Ask',
        options: {
            filter: false,
            sort: true,
            sortThirdClickReset: true,
        },
    },
];

export const PeerOrderbookView = () => {
    const { width, breakpoints } = useWindowSize();
    const { handleCurrentClick, items, currentIndex } = useDropdown(
        [{ text: 'All' }, { text: 'NFTs' }, { text: 'Pairs' }],
        0,
        true,
    );
    const { order, loading } = useTrade();
    const { filteredNfts } = useLimitOrders('peer-orderbook');
    const { state } = useLocation();
    const { multiaddr } = useParams();
    const { limitOrdersArr } = useOffersContext();
    const [uniquePairs, setUniquePairs] = useState<any[]>([]);
    const { pintswap } = usePintswapContext();
    const [resolved, setResolved] = useState<any>(null);

    useEffect(() => {
        (async () => {
            if (multiaddr && pintswap && pintswap.module) {
                if (multiaddr.match('.drip'))
                    setResolved(await resolveName(pintswap.module, multiaddr));
                else setResolved(multiaddr);
            }
        })().catch((err) => console.error(err));
    }, [multiaddr, pintswap.module]);

    useEffect(() => {
        const byTicker = groupBy(
            limitOrdersArr.filter((v) => [multiaddr, resolved].includes(v.peer)),
            'ticker',
        );
        setUniquePairs(
            Object.entries(byTicker).map(([ticker, group]) => ({
                ...bestPrices(group),
                ticker: ticker,
            })),
        );
    }, [limitOrdersArr, resolved, multiaddr]);

    const peer = state?.peer ? state.peer : multiaddr ? multiaddr : order.multiAddr;

    return (
        <div className="flex flex-col">
            <div className="grid grid-cols-2 items-center justify-between mb-4 md:mb-6">
                <Header
                    breadcrumbs={[
                        { text: 'Peers', link: '/peers' },
                        { text: `${multiaddr}`, link: `/${multiaddr}` },
                    ]}
                >
                    Peer Overview
                </Header>

                <div className="justify-self-end hidden sm:block">
                    <Avatar peer={multiaddr} nameClass="text-xl" type="profile" />
                </div>
            </div>

            <Card
                tabs={['ERC20', 'NFT']}
                type="tabs"
                defaultTab={uniquePairs.length === 0 && filteredNfts.length ? 'nft' : 'erc20'}
            >
                <Tab.Panel>
                    <DataTable
                        type="peer-orderbook"
                        data={uniquePairs}
                        columns={columns}
                        loading={false}
                        peer={multiaddr}
                    />
                </Tab.Panel>
                <Tab.Panel>
                    <NFTTable
                        data={filteredNfts}
                        peer={order.multiAddr}
                        loading={loading.allTrades}
                    />
                </Tab.Panel>
            </Card>

            {/* <div className="flex flex-col">
                <div
                    className={`${
                        currentIndex === 0 ? 'block' : 'hidden'
                    } flex flex-col gap-3 lg:gap-6`}
                >
                    <div className="flex flex-col gap-3">
                        <span className="text-lg">Pairs</span>
                        <PairsTable />
                    </div>
                    <div className="flex flex-col gap-3">
                        <span className="text-lg">NFTs</span>
                        <NFTTable
                            data={filteredNfts.slice(0, width > breakpoints.lg ? 3 : 2)}
                            peer={order.multiAddr}
                            loading={loading.allTrades}
                        />
                        {filteredNfts.length > 2 && (
                            <Button
                                onClick={() => handleCurrentClick('nfts')}
                                className="w-fit self-center"
                                type="outline"
                            >
                                See All NFTs
                            </Button>
                        )}
                    </div>
                </div>
                <div
                    className={`${
                        currentIndex === 1 ? 'block' : 'hidden'
                    } flex flex-col gap-3 lg:gap-6`}
                >
                    <span className="text-lg">NFTs</span>
                    <NFTTable
                        data={filteredNfts}
                        peer={order.multiAddr}
                        loading={loading.allTrades}
                        paginated
                    />
                    <Button
                        onClick={() => handleCurrentClick('all')}
                        className="w-fit self-center"
                        type="outline"
                    >
                        Back to All
                    </Button>
                </div>
                <div
                    className={`${
                        currentIndex === 2 ? 'block' : 'hidden'
                    } flex flex-col gap-3 lg:gap-6`}
                >
                    <span className="text-lg">Pairs</span>
                    <PairsTable />
                    <Button
                        onClick={() => handleCurrentClick('all')}
                        className="w-fit self-center"
                        type="outline"
                    >
                        Back to All
                    </Button>
                </div>
            </div> */}
        </div>
    );
};
