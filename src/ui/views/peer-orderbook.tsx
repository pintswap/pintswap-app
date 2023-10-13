import { Card, Header, TransitionModal } from '../components';
import { Avatar } from '../features';
import { DataTable, NFTTable } from '../tables';
import { useLocation, useParams } from 'react-router-dom';
import { useLimitOrders, useTrade } from '../../hooks';
import { useEffect, useState } from 'react';
import { useOffersContext, usePintswapContext } from '../../stores';
import { groupBy } from 'lodash';
import { bestPrices } from '../../utils';
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
    const { order, loading } = useTrade();
    const { filteredNfts } = useLimitOrders('peer-orderbook');
    const { state } = useLocation();
    const { multiaddr } = useParams();
    const { offersByChain } = useOffersContext();
    const [uniquePairs, setUniquePairs] = useState<any[]>([]);
    const { pintswap } = usePintswapContext();
    const [resolved, setResolved] = useState<any>(null);

    useEffect(() => {
        (async () => {
            if (multiaddr && pintswap && pintswap.module) {
                if (multiaddr.match('.drip'))
                    setResolved(await pintswap.module.resolveName(multiaddr));
                else setResolved(multiaddr);
            }
        })().catch((err) => console.error(err));
    }, [multiaddr, pintswap.module]);

    useEffect(() => {
        const byTicker = groupBy(
            offersByChain.erc20.filter((v) => [multiaddr, resolved].includes(v.peer)),
            'ticker',
        );
        setUniquePairs(
            Object.entries(byTicker).map(([ticker, group]) => ({
                ...bestPrices(group),
                ticker: ticker,
            })),
        );
    }, [offersByChain.erc20, resolved, multiaddr]);

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
                    <TransitionModal
                        button={
                            <Avatar
                                peer={multiaddr}
                                nameClass="text-xl"
                                type="profile"
                                align="left"
                            />
                        }
                    >
                        <Avatar peer={multiaddr} size={300} />
                    </TransitionModal>
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
        </div>
    );
};
