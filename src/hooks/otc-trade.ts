import { SyntheticEvent, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import {
    EMPTY_TRADE,
    IOrderbookProps,
    TESTING,
    displayOffer,
    getSymbol,
    reverseSymbolCache,
    renderToast,
} from '../utils';
import { useOffersContext, usePintswapContext } from '../stores';
import { useSwitchNetwork } from 'wagmi';
import { IOffer, hashOffer } from '@pintswap/sdk';
import { toast } from 'react-toastify';
import { useQuery } from '@tanstack/react-query';

export const useOtcTrade = () => {
    const { chainid, hash, multiaddr } = useParams(); // chainid, multiaddr, hash
    const { pathname } = useLocation();
    const {
        pintswap: { module, chainId },
    } = usePintswapContext();
    const { switchNetworkAsync } = useSwitchNetwork();
    const { allOffers } = useOffersContext();

    const onFulfill = pathname.includes('fulfill');

    const [trade, setTrade] = useState({ raw: EMPTY_TRADE, display: EMPTY_TRADE });
    const [fillingTrade, setFillingTrade] = useState(false);
    const [error, setError] = useState('');

    async function executeTrade(e: SyntheticEvent) {
        e.preventDefault();
        setFillingTrade(true);
        renderToast('filling-otc-trade', 'pending', 'Initiating trade');

        if (module) {
            return;
        }
    }

    async function findOrder() {
        console.log('hit');
        if (module && onFulfill) {
            renderToast('otc-loading', 'pending', 'Connecting to peer');
            let _offers = new Map();
            // If chainId
            if (chainid && Number(chainid) !== chainId && switchNetworkAsync) {
                switchNetworkAsync(Number(chainid));
            }

            // If multiaddr
            if (multiaddr) {
                if (TESTING) console.log('OTC | offer params:', { multiaddr, hash, chainId });
                let peer: IOrderbookProps;
                try {
                    peer = await module.getUserData(multiaddr);
                    console.log('peer', peer);
                } catch (e) {
                    setError('No trades found');
                    renderToast('otc-loading', 'error', 'No trades found');
                    return EMPTY_TRADE;
                }

                toast.update('otc-loading', { render: 'Connected to peer' });

                const promisedOffers = await Promise.all(
                    peer.offers.map(async (offer) => {
                        const tokens = [offer.gets?.token, offer.gives?.token];
                        return await Promise.all(
                            tokens.map(async (t) => {
                                if (!Object.values(reverseSymbolCache[chainId]).includes(t)) {
                                    const symbol = await getSymbol(t, chainId);
                                    reverseSymbolCache[chainId][symbol] = t;
                                }
                            }),
                        );
                    }),
                );
                console.log('promised offers', promisedOffers);
                _offers = new Map(peer.offers.map((offer) => [hashOffer(offer), offer]));
                if (TESTING) console.log('OTC | peer offers:', _offers);
            }

            // If offer hash
            if (hash) {
                if (TESTING) console.log('OTC | offer hash:', hash);
                const found1 = _offers?.get(hash);
                if (found1) {
                    setTrade({ display: await displayOffer(found1), raw: found1 });
                    renderToast('otc-loading', 'success', 'Found trade');
                    return found1;
                }

                // Check public orderbook if there's an offer hash
                const found2 = [...allOffers.erc20, ...allOffers.nft].find(
                    (el) => el.hash?.toLowerCase() === hash?.toLowerCase(),
                );
                if (found2) {
                    setTrade({ raw: found2.raw, display: await displayOffer(found2.raw) });
                    renderToast('otc-loading', 'success', 'Found trade');
                    return found2.raw;
                }
            }
            setError('Trade not found');
            renderToast('otc-loading', 'error', 'Trade not found');
        }
        return EMPTY_TRADE;
    }
    const queryTrade = useQuery({
        queryKey: ['otc-trade', multiaddr, hash],
        queryFn: findOrder,
        enabled: !trade.raw.gets.token && module?.isStarted(),
        refetchInterval: 500,
    });

    return {
        trade,
        loadingTrade: queryTrade.isLoading,
        fillingTrade,
        error,
        executeTrade,
    };
};
