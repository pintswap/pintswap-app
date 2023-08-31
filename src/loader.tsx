import ReactDOM from 'react-dom/client';
import App from './App';
import { WagmiConfig } from 'wagmi';
import { chains, RainbowKitProvider, wagmiClient, walletTheme } from './utils/wallet';
import { HashRouter } from 'react-router-dom';
import {
    PintswapStore,
    OffersStore,
    ThemeStore,
    UserStore,
    PeersStore,
    PricesStore,
} from './stores';

import './styles/tailwind.css';
import 'react-tooltip/dist/react-tooltip.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <>
        <ThemeStore>
            <WagmiConfig client={wagmiClient}>
                <RainbowKitProvider chains={chains} theme={walletTheme}>
                    <PintswapStore>
                        <PricesStore>
                            <OffersStore>
                                <UserStore>
                                    <PeersStore>
                                        <HashRouter>
                                            <App />
                                        </HashRouter>
                                    </PeersStore>
                                </UserStore>
                            </OffersStore>
                        </PricesStore>
                    </PintswapStore>
                </RainbowKitProvider>
            </WagmiConfig>
        </ThemeStore>
    </>,
);
