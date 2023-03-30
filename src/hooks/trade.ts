import { useEffect, useState } from 'react';
import { useGlobalContext } from '../stores/global';
import { EMPTY_TRADE, getDecimals, WS_URL } from '../utils/common';
import { useLocation } from 'react-router-dom';
import { DEFAULT_PROGRESS } from '../components/progress-indicator';
import { ethers } from 'ethers';
import { IOffer, hashOffer } from 'pintswap-sdk';
import { TOKENS } from '../utils/token-list';
import useWebSocket from 'react-use-websocket';
import { usePeerContext } from '../stores';

type IOrderStateProps = {
    orderHash: string;
    multiAddr: string | any;
}

export const useTrade = () => {
    const { pathname } = useLocation();
    const { addTrade, pintswap } = useGlobalContext();
    const { peer } = usePeerContext();
    const [loading, setLoading] = useState(false);
    const [trade, setTrade] = useState<IOffer>(EMPTY_TRADE);
    const [order, setOrder] = useState<IOrderStateProps>({ orderHash: '', multiAddr: '' });
    const [steps, setSteps] = useState(DEFAULT_PROGRESS);

    const buildTradeObj = (): IOffer => {
        if(!trade.getsToken || !trade.getsAmount || !trade.givesAmount || !trade.givesToken) return EMPTY_TRADE;
        return {
            givesToken: TOKENS.find((el) => el.symbol === trade.givesToken)?.address || '',
            getsToken: TOKENS.find((el) => el.symbol === trade.getsToken)?.address || '',
            givesAmount: ethers.utils.parseUnits(trade.givesAmount, getDecimals(trade.givesToken)).toHexString(),
            getsAmount: ethers.utils.parseUnits(trade.getsAmount, getDecimals(trade.getsToken)).toHexString()
        }
    }

    useWebSocket(`${WS_URL}`, {
        onOpen() {
          console.log('WebSocket connection established.');
        },
        onMessage(event) {
            console.log("event", event)
        },
      });
    
    // Create trade
    const broadcastTrade = async () => {
        setLoading(true);
        console.log("CREATE TRADE:", buildTradeObj())

        if(pintswap && peer.id) {
            try {
                // TODO: if ETH, convert to WETH first
                pintswap.broadcastOffer(buildTradeObj());
                const orderHash = hashOffer(buildTradeObj());
                setOrder({ multiAddr: pintswap.peerId, orderHash });
                addTrade(orderHash, trade);
                updateSteps('Create', 'complete');
                updateSteps('Fulfill', 'current');
            } catch (err) {
                console.error(err);
            }
        }
        setLoading(false);
    };

    // Fulfill trade
    const fulfillTrade = async () => {
        setLoading(true);
        if(pintswap) {
            try {
                const res = await pintswap.createTrade(`/${peer.id}`, buildTradeObj());
                console.log("FULFILL TRADE:", trade);
                updateSteps('Fulfill', 'complete');
                updateSteps('Complete', 'current');
            } catch (err) {
                console.error(err);
            }
        }
        setLoading(false);
    }
    
    // TODO: connect to sdk
    const getTrade = async (multiAddr: string, orderHash: string) => {
        setLoading(true);
        try {
            console.log("multi address:", multiAddr)
            console.log("order hash:", orderHash)
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }

    // Update order form
    const updateTrade = (key: 'givesToken' | 'getsToken' | 'givesAmount' | 'getsAmount', val: string) => {
        setTrade({
            ...trade,
            [key]: val,
        });
    };

    // Update progress indicator
    const updateSteps = (name: 'Create' | 'Fulfill' | 'Complete', status: 'upcoming' | 'current' | 'complete') => {
        setSteps(steps.map(el => (el.name === name ? Object.assign({}, el, { status }) : el)));
    }

    // Get trade based on URL
    useEffect(() => {
        if(pathname.includes('/')) {
            const splitUrl = pathname.split('/');
            if(splitUrl.length === 3) {
                setOrder({ orderHash: splitUrl[1], multiAddr: splitUrl[2] })
                getTrade(splitUrl[1], splitUrl[2])
            }
        }
    }, []);

    return {
        loading,
        broadcastTrade,
        trade,
        updateTrade,
        fulfillTrade,
        getTrade,
        order,
        steps,
        updateSteps
    };
};
