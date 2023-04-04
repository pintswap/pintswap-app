import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/tailwind.css';
import App from './App';
import { WagmiConfig } from 'wagmi';
import { chains, RainbowKitProvider, wagmiClient, walletTheme } from './utils/wallet';
import { HashRouter } from 'react-router-dom';
import { GlobalStore } from './stores';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <>
        <WagmiConfig client={wagmiClient}>
            <RainbowKitProvider chains={chains} theme={walletTheme}>
                    <GlobalStore>
                            <HashRouter>
                                <App />
                            </HashRouter>
                    </GlobalStore>
            </RainbowKitProvider>
        </WagmiConfig>
    </>,
);
