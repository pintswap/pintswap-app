import { Route, Routes, Navigate } from 'react-router-dom';
import { Base } from './base';
import { usePintswapContext } from './stores';
import {
    ExploreView,
    CreateView,
    FulfillView,
    PeerOrderbookView,
    AccountView,
    PairsView,
    PeersView,
    PairListView,
    PeerTickerOrderbookView,
    TradeSearchView,
} from './views';
import { FulfillNFTView } from './views/fulfill-nft';
import { setFallbackWETH } from '@pintswap/sdk';
import { ToastContainer } from 'react-toastify';
import { Pintswap } from '@pintswap/sdk';
import { detectPermit } from '@pintswap/sdk/lib/detect-permit';

import { useSigner } from 'wagmi';
import 'react-toastify/dist/ReactToastify.css';
import { cryptoFromSeed } from '@pintswap/sdk/lib/p2p';
import { SwapView } from './views/swap';
import { useEffect } from 'react';

setFallbackWETH('0x7a2088a1bFc9d81c55368AE168C2C02570cB814F');

(window as any).Pintswap = Pintswap;
(window as any).cryptoFromSeed = cryptoFromSeed;
(window as any).detectPermit = detectPermit;

function App() {
    const { pintswap } = usePintswapContext();
    const { data: signer } = useSigner();
    (window as any).signer = signer;
    if (!(window as any).pintswap && pintswap.module) {
        (window as any).pintswap = pintswap.module;
        (window as any).pintswap.logger.info = () => {};
    }

    return (
        <>
            <Base loading={pintswap.loading}>
                <Routes>
                    <Route path="/swap" element={<SwapView />} />
                    <Route path="/markets" element={<PairsView />} />
                    <Route path="/create" element={<CreateView />} />
                    <Route path="/account" element={<AccountView />} />

                    <Route path="/markets/:pair" element={<PairListView />} />
                    {/* <Route path="/markets/:pair/:multiaddr" element={<PeerTickerOrderbookView />} /> */}

                    <Route path="/peers" element={<PeersView />} />
                    <Route path="/peers/:multiaddr" element={<PeerOrderbookView />} />
                    <Route path="/peers/:multiaddr/:view" element={<PeerOrderbookView />} />

                    {/* <Route path="/:multiaddr" element={<PeerOrderbookView />} />
                    <Route path="/:multiaddr/:view" element={<PeerOrderbookView />} /> */}
                    <Route path="/:multiaddr/:trade/:base" element={<PeerTickerOrderbookView />} />

                    <Route path="/fulfill" element={<TradeSearchView />} />
                    <Route path="/fulfill/:multiaddr/:hash" element={<FulfillView />} />
                    <Route path="/fulfill/:multiaddr/nft/:hash" element={<FulfillNFTView />} />

                    <Route path="*" element={<Navigate to="/swap" />} />
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
