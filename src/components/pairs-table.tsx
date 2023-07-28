import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Asset, Card } from '../components';
import { useOffersContext, usePintswapContext } from '../stores';
import { getTokenLogo } from '../utils/token';
import { resolveName } from '../hooks/trade';
import { useParams } from 'react-router-dom';
import { groupBy } from 'lodash';

const formatPrice = (v: any) => String(v).substr(0, 10);

const bestPrices = (orders: any) => {
    const { ask, bid } = groupBy(orders, 'type');
    const bestAsk = (ask || []).slice().sort((a, b) => Number(a.price) - Number(b.price))[0];
    const bestBid = (bid || []).slice().sort((a, b) => Number(b.price) - Number(a.price))[0];
    return {
        bid: (bestBid?.price && formatPrice(bestBid.price)) || 'N/A',
        ask: (bestAsk?.price && formatPrice(bestAsk.price)) || 'N/A',
    };
};

export const PairsTable = () => {
    const navigate = useNavigate();
    const { limitOrdersArr } = useOffersContext();
    const [uniquePairs, setUniquePairs] = useState<any[]>([]);
    const { pintswap } = usePintswapContext();
    const { multiaddr } = useParams();
    const [resolved, setResolved] = useState<any>(null);

    useEffect(() => {
        (async () => {
            if (multiaddr && pintswap && pintswap.module) {
                if (multiaddr.match('.drip'))
                    setResolved(await resolveName(pintswap.module, multiaddr));
                else setResolved(multiaddr);
            }
        })().catch((err) => console.error(err));
    }, [multiaddr, pintswap.module]);

    useEffect(() => {
        const byTicker = groupBy(
            limitOrdersArr.filter((v) => [multiaddr, resolved].includes(v.peer)),
            'ticker',
        );
        setUniquePairs(
            Object.entries(byTicker).map(([ticker, group]) => ({
                price: bestPrices(group),
                ticker: ticker,
            })),
        );
    }, [limitOrdersArr, resolved, multiaddr]);

    const isLoading = uniquePairs.length === 0;

    return (
        <div className="flex flex-col">
            <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`}>
                {!isLoading
                    ? uniquePairs.map((pair) => {
                          const split = pair.ticker.split('/');
                          const token1 = split[0];
                          const token2 = split[1];
                          const icon1 = getTokenLogo(token1);
                          const icon2 = getTokenLogo(token2);
                          return (
                              <button
                                  key={`unique-pair-${pair.ticker}`}
                                  onClick={() => navigate(`/${multiaddr}/${pair.ticker}`)}
                              >
                                  <Card className="hover:bg-gray-900" type="inner">
                                      <div
                                          className={`text-center flex items-center justify-center gap-3`}
                                      >
                                          <Asset icon={icon1} symbol={token1} />
                                          <span>/</span>
                                          <Asset icon={icon2} symbol={token2} />
                                      </div>
                                      <div className="flex items-center justify-around mt-1">
                                          <small className="text-green-400">
                                              BID: {pair.price.bid}
                                          </small>
                                          <small className="text-red-400">
                                              ASK: {pair.price.ask}
                                          </small>
                                      </div>
                                  </Card>
                              </button>
                          );
                      })
                    : [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                          <Card key={`loading-card-${i}`} className="justify-start" type="inner">
                              <div className={`text-center flex items-center justify-center gap-3`}>
                                  <Asset loading />
                                  <span>/</span>
                                  <Asset loading />
                              </div>
                              <div className="flex items-center justify-around mt-1">
                                  <div
                                      className={`animate-pulse bg-neutral-700 h-4 w-16 rounded`}
                                  />
                                  <div
                                      className={`animate-pulse bg-neutral-700 h-4 w-16 rounded`}
                                  />
                              </div>
                          </Card>
                      ))}
            </div>
        </div>
    );
};
