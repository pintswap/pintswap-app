import { Route, Routes } from 'react-router-dom';
import { Base } from './base';
import { useGlobalContext } from './stores';
import { CreateView, FulfillView, HomeView } from './views';
import { setFallbackWETH } from "pintswap-sdk";
import { ToastContainer } from 'react-toastify';

setFallbackWETH('0x7a2088a1bFc9d81c55368AE168C2C02570cB814F');

function App() {
    const { peer } = useGlobalContext();
    return (
        <>
            <Base loading={peer.loading}>
                <Routes>
                    <Route path="/" element={<HomeView />} />
                    <Route path="/create" element={<CreateView />} />
                    <Route path="/fulfill" element={<FulfillView />} />
                    <Route path="/:address/:multiaddr" element={<FulfillView />} />
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
                toastClassName="!bg-neutral-800"
            />
        </>
    );
}

export default App;
