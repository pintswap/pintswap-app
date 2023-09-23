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
    NetworkStore,
} from './stores';

import './styles/tailwind.css';
import 'react-tooltip/dist/react-tooltip.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <WagmiConfig client={wagmiClient}>
        <ThemeStore>
            <RainbowKitProvider chains={chains} theme={walletTheme}>
                <NetworkStore>
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
                </NetworkStore>
            </RainbowKitProvider>
        </ThemeStore>
    </WagmiConfig>,
);
