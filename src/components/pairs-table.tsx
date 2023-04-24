import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Asset, Card } from '../components';
import { useOffersContext } from '../stores';
import { useGlobalContext } from '../stores/global';
import { getTokenAttributes } from '../utils/common';
import { resolveName } from '../hooks/trade';
import { useParams } from 'react-router-dom';
import { groupBy } from 'lodash';

const formatOrNothing = (type: any, best: any) => {
    if (!best) return '';
    return `${type.toUpperCase()}${best.price} `;
};

const bestPrices = (orders: any) => {
    const { ask, bid } = groupBy(orders, 'type');
    const bestAsk = (ask || []).slice().sort((a, b) => Number(b.price) - Number(a.price))[0];
    const bestBid = (bid || []).slice().sort((a, b) => Number(a.price) - Number(b.price))[0];
    return formatOrNothing('bid', bestBid) + formatOrNothing('ask', bestAsk);
};

export const PairsTable = () => {
    const navigate = useNavigate();
    const { limitOrdersArr } = useOffersContext();
    console.log('LIMITORDERSARR', limitOrdersArr);
    const [uniquePairs, setUniquePairs] = useState<any[]>([]);
    const { pintswap } = useGlobalContext();
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
            <h3 className="text-xl text-center mb-4 lg:mb-6 font-semibold"></h3>
            <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`}>
                {!isLoading
                    ? uniquePairs.map((pair) => {
                          const split = pair.ticker.split('/');
                          const token1 = split[0];
                          const token2 = split[1];
                          const icon1 = getTokenAttributes(token1, 'logoURI')?.toString();
                          const icon2 = getTokenAttributes(token2, 'logoURI')?.toString();
                          return (
                              <button
                                  key={`unique-pair-${pair.ticker}`}
                                  onClick={() => navigate(`/${multiaddr}/${pair.ticker}`)}
                              >
                                  <Card className="hover:bg-gray-900">
                                      <div
                                          className={`text-center flex items-center justify-center gap-3`}
                                      >
                                              <Asset icon={icon1} symbol={token1} />
                                              <span>/</span>
                                              <Asset icon={icon2} symbol={token2} />
                                      </div>
                                      <div>{pair.price}</div>
                                  </Card>
                              </button>
                          );
                      })
                    : [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                          <Card key={`loading-card-${i}`} className="justify-start">
                              <div className={`text-center flex items-center justify-center gap-3`}>
                                  <Asset loading />
                                  <span>/</span>
                                  <Asset loading />
                              </div>
                          </Card>
                      ))}
            </div>
        </div>
    );
};
