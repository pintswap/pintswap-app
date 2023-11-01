import ReactDOM from 'react-dom/client';
import App from './App';
import { WagmiConfig } from 'wagmi';
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
import { ReactQueryProvider, chains, RainbowKitProvider, wagmiClient, walletTheme } from './config';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <HashRouter>
        <ReactQueryProvider>
            <WagmiConfig client={wagmiClient}>
                <ThemeStore>
                    <RainbowKitProvider chains={chains} theme={walletTheme}>
                        <NetworkStore>
                            <PintswapStore>
                                <PricesStore>
                                    <OffersStore>
                                        <UserStore>
                                            <PeersStore>
                                                <App />
                                            </PeersStore>
                                        </UserStore>
                                    </OffersStore>
                                </PricesStore>
                            </PintswapStore>
                        </NetworkStore>
                    </RainbowKitProvider>
                </ThemeStore>
            </WagmiConfig>
        </ReactQueryProvider>
    </HashRouter>,
);
