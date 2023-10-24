import { Route, Routes, Navigate } from 'react-router-dom';
import { Base } from './ui/base';
import { usePintswapContext } from './stores';
import { ToastContainer } from 'react-toastify';
import { detectPermit } from '@pintswap/sdk/lib/detect-permit';
import { useSigner } from 'wagmi';
import { cryptoFromSeed, Pintswap, setFallbackWETH } from '@pintswap/sdk';
import {
    CreateView,
    FulfillView,
    PeerOrderbookView,
    AccountView,
    PeersView,
    PeerTickerOrderbookView,
    TradeSearchView,
    MarketsTableView,
    SwapView,
    FulfillNFTView,
    NFTsTableView,
    MarketsSwapView,
    StakingView,
} from './ui/views';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect, useState } from 'react';

setFallbackWETH('0x7a2088a1bFc9d81c55368AE168C2C02570cB814F');

(window as any).Pintswap = Pintswap;
(window as any).cryptoFromSeed = cryptoFromSeed;
(window as any).detectPermit = detectPermit;

function App() {
    const { pintswap } = usePintswapContext();
    const { data: signer } = useSigner();
    const [mockLoading, setMockLoading] = useState(true);
    (window as any).signer = signer;
    if (!(window as any).pintswap && pintswap.module) {
        (window as any).pintswap = pintswap.module;
        (window as any).pintswap.logger.info = () => {};
    }

    useEffect(() => {
        const timeout = setTimeout(() => setMockLoading(false), 2000);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <>
            <Base loading={mockLoading}>
                <Routes>
                    <Route path="/swap" element={<SwapView />} />
                    <Route path="/markets" element={<MarketsTableView />} />
                    <Route path="/nfts" element={<NFTsTableView />} />
                    <Route path="/create" element={<CreateView />} />
                    {/* <Route path="/staking" element={<StakingView />} /> */}
                    <Route path="/account" element={<AccountView />} />

                    <Route path="/markets/:pair" element={<MarketsSwapView />} />
                    {/* <Route path="/markets/:pair/:multiaddr" element={<PeerTickerOrderbookView />} /> */}

                    <Route path="/peers" element={<PeersView />} />
                    <Route path="/peers/:multiaddr" element={<PeerOrderbookView />} />
                    <Route path="/peers/:multiaddr/:pair" element={<MarketsSwapView />} />

                    {/* <Route path="/:multiaddr" element={<PeerOrderbookView />} />
                    <Route path="/:multiaddr/:view" element={<PeerOrderbookView />} /> */}
                    <Route path="/:multiaddr/:trade/:base" element={<PeerTickerOrderbookView />} />

                    <Route path="/fulfill" element={<TradeSearchView />} />
                    <Route path="/fulfill/:multiaddr/:hash" element={<FulfillView />} />
                    <Route path="/fulfill/:multiaddr/nft/:hash" element={<FulfillNFTView />} />
                    <Route path="/fulfill/:multiaddr/:hash/:chainid" element={<FulfillView />} />
                    <Route
                        path="/fulfill/:multiaddr/nft/:hash/:chainid"
                        element={<FulfillNFTView />}
                    />

                    <Route path="*" element={<Navigate to={'/markets'} />} />
                </Routes>
            </Base>

            <ToastContainer
                position="bottom-right"
                autoClose={6000}
                hideProgressBar={false}
                newestOnTop={false}
                rtl={false}
                draggable
                pauseOnHover
                theme="dark"
                toastClassName="!bg-brand-dashboard"
            />
        </>
    );
}

export default App;
