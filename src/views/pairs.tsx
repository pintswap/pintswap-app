import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Asset, Card } from "../components";
import { useOffersContext } from "../stores";
import { getTokenAttributes } from "../utils/common";

export const PairsView = () => {
  const navigate = useNavigate();
  const { limitOrdersArr } = useOffersContext();
  const [uniquePairs, setUniquePairs] = useState<string[]>([]);
  console.log('limitOrdersArr', limitOrdersArr);

  useEffect(() => {
    if(limitOrdersArr) {
      setUniquePairs(Array.from(new Set(limitOrdersArr.map(o => o.ticker))))
    }
  }, [limitOrdersArr])

  const isLoading = uniquePairs.length === 0;

    return (
        <div className="flex flex-col">
          <h3 className="view-header">Available Pairs</h3>
          <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`}>
            {!isLoading ? uniquePairs.map(pair => {
              const split = pair.split('/');
              const token1 = split[0];
              const token2 = split[1];
              const icon1 = getTokenAttributes(token1, 'logoURI')?.toString();
              const icon2 = getTokenAttributes(token2, 'logoURI')?.toString();
              return (
                <button key={`unique-pair-${pair}`} onClick={() => navigate(`/pairs/${token1.toLowerCase()}-${token2.toLowerCase()}`)}>
                  <Card className="hover:bg-gray-900">
                    <div className={`text-center flex items-center justify-center gap-3`}>
                      <Asset icon={icon1} symbol={token1} />
                      <span>/</span>
                      <Asset icon={icon2} symbol={token2} />
                    </div>
                  </Card>
                </button>
              )
            }) : [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
