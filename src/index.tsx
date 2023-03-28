import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/tailwind.css';
import App from './App';
import { WagmiConfig } from 'wagmi';
import { chains, RainbowKitProvider, wagmiClient } from './utils/wallet';
import { HashRouter } from 'react-router-dom';
import { GlobalStore } from './stores/global';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <>
        <WagmiConfig client={wagmiClient}>
            <RainbowKitProvider chains={chains}>
                    <GlobalStore>
                        <HashRouter>
                            <App />
                        </HashRouter>
                    </GlobalStore>
            </RainbowKitProvider>
        </WagmiConfig>
    </>,
);
