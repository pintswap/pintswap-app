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
    TradeSearchView,
} from './views';
import { setFallbackWETH } from '@pintswap/sdk';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAccount } from 'wagmi';

setFallbackWETH('0x7a2088a1bFc9d81c55368AE168C2C02570cB814F');

function App() {
    const { pintswap } = useGlobalContext();
    const { address } = useAccount();
    return (
        <>
            <Base loading={pintswap.loading}>
                {address ? (
                    <Routes>
                        <Route path="/explore" element={<ExploreView />} />
                        <Route path="/create" element={<CreateView />} />
                        <Route path="/account" element={<AccountView />} />

                        <Route path="/pairs" element={<PairsView />} />
                        <Route path="/pairs/:pair" element={<PairListView />} />

                        <Route path="/peers" element={<PeersView />} />
                        <Route path="/peers/:multiaddr" element={<PeerOrderbookView />} />

                        <Route path="/fulfill" element={<TradeSearchView />} />
                        <Route path="/fulfill/:multiaddr/:hash" element={<FulfillView />} />

                        <Route path="*" element={<Navigate to='/explore' />} />
                    </Routes>
                ) : (
                    <Routes>
                        <Route path="/explore" element={<ExploreView />} />

                        <Route path="/pairs" element={<PairsView />} />
                        <Route path="/pairs/:pair" element={<PairListView />} />

                        <Route path="/peers" element={<PeersView />} />
                        <Route path="/peers/:multiaddr" element={<PeerOrderbookView />} />

                        <Route path="*" element={<Navigate to='/explore' />} />
                    </Routes>
                )}
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
