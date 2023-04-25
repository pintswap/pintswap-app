import { Route, Routes, Navigate } from 'react-router-dom';
import { Base } from './base';
import { useGlobalContext } from './stores';
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
import { FulfillNFTView } from "./views/fulfill-nft";
import { setFallbackWETH } from '@pintswap/sdk';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAccount } from 'wagmi';

setFallbackWETH('0x7a2088a1bFc9d81c55368AE168C2C02570cB814F');

function App() {
    const { pintswap } = useGlobalContext();
    if (!(window as any).pintswap && pintswap.module) (window as any).pintswap = pintswap.module;
    const { address } = useAccount();
    return (
        <>
            <Base loading={pintswap.loading}>
                    <Routes>
                        <Route path="/explore" element={<ExploreView />} />
                        <Route path="/create" element={<CreateView />} />
                        <Route path="/account" element={<AccountView />} />

                        <Route path="/pairs" element={<PairsView />} />
                        <Route path="/pairs/:pair" element={<PairListView />} />

                        <Route path="/peers" element={<PeersView />} />

                        <Route path="/:multiaddr" element={<PeerOrderbookView />} />
                        <Route path="/:multiaddr/:view" element={<PeerOrderbookView />} />
                        <Route path="/:multiaddr/:trade/:base" element={<PeerTickerOrderbookView />} />

                        <Route path="/fulfill" element={<TradeSearchView />} />
                        <Route path="/fulfill/:multiaddr/:hash" element={<FulfillView />} />
                        <Route path="/fulfill/:multiaddr/nft/:hash" element={<FulfillNFTView />} />

                        <Route path="*" element={<Navigate to='/explore' />} />
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
                toastClassName="!bg-neutral-900"
            />
        </>
    );
}

export default App;
