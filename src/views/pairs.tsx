import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Asset, Card, Input } from '../components';
import { useOffersContext } from '../stores';
import { getTokenLogo } from '../utils/token';
import { useSearch } from '../hooks';

export const PairsView = () => {
    const navigate = useNavigate();
    const { limitOrdersArr } = useOffersContext();
    const [uniquePairs, setUniquePairs] = useState<string[]>([]);
    const { query, list, handleChange } = useSearch(uniquePairs);

    useEffect(() => {
        if (limitOrdersArr) {
            setUniquePairs(Array.from(new Set(limitOrdersArr.map((o) => o.ticker))));
        }
    }, [limitOrdersArr]);

    const isLoading = uniquePairs.length === 0;

    return (
        <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4 md:mb-6 gap-6">
                <h2 className="view-header mb-0">Explore</h2>
                <Input
                    value={query}
                    onChange={handleChange}
                    type="search"
                    wrapperClass="max-w-[200px] sm:max-w-[250px] md:max-w-[300px] lg:max-w-[350px]"
                    noSpace
                />
            </div>
            <div
                className={`grid grid-cols-1 gap-2 md:gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5`}
            >
                {!isLoading
                    ? (list as string[]).map((pair) => {
                          const split = pair.split('/');
                          const token1 = split[0];
                          const token2 = split[1];
                          const icon1 = getTokenLogo(token1);
                          const icon2 = getTokenLogo(token2);
                          return (
                              <button
                                  key={`unique-pair-${pair}`}
                                  onClick={() =>
                                      navigate(
                                          `/markets/${token1.toLowerCase()}-${token2.toLowerCase()}`,
                                      )
                                  }
                              >
                                  <Card className="hover:bg-gray-900">
                                      <div
                                          className={`text-center flex items-center justify-center gap-3`}
                                      >
                                          <Asset icon={icon1} symbol={token1} />
                                          <span>/</span>
                                          <Asset icon={icon2} symbol={token2} />
                                      </div>
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
