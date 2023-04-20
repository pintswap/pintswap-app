import ReactDOM from 'react-dom/client';
import './styles/tailwind.css';
import App from './App';
import { WagmiConfig } from 'wagmi';
import { chains, RainbowKitProvider, wagmiClient, walletTheme } from './utils/wallet';
import { HashRouter } from 'react-router-dom';
import { GlobalStore, OffersStore, ThemeStore, UserStore, PeersStore } from './stores';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <>
        <ThemeStore>
            <WagmiConfig client={wagmiClient}>
                <RainbowKitProvider chains={chains} theme={walletTheme}>
                    <GlobalStore>
                        <OffersStore>
                            <UserStore>
                                <PeersStore>
                                <HashRouter>
                                    <App />
                                </HashRouter>
                                </PeersStore>
                            </UserStore>
                        </OffersStore>
                    </GlobalStore>
                </RainbowKitProvider>
            </WagmiConfig>
        </ThemeStore>
    </>,
);
