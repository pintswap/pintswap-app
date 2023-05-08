import ReactDOM from 'react-dom/client';
import './styles/tailwind.css';
import App from './App';
import { WagmiConfig } from 'wagmi';
import { chains, RainbowKitProvider, wagmiClient, walletTheme } from './utils/wallet';
import { HashRouter } from 'react-router-dom';
import { PintswapStore, OffersStore, ThemeStore, UserStore, PeersStore } from './stores';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <>
        <ThemeStore>
            <WagmiConfig client={wagmiClient}>
                <RainbowKitProvider chains={chains} theme={walletTheme}>
                    <PintswapStore>
                        <OffersStore>
                            <UserStore>
                                <PeersStore>
                                <HashRouter>
                                    <App />
                                </HashRouter>
                                </PeersStore>
                            </UserStore>
                        </OffersStore>
                    </PintswapStore>
                </RainbowKitProvider>
            </WagmiConfig>
        </ThemeStore>
    </>,
);
