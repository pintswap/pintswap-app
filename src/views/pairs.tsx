import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, SpinnerLoader } from "../components";
import { useOffersContext } from "../stores";
import { getTokenAttributes } from "../utils/common";

export const PairsView = () => {
  const navigate = useNavigate();
  const { limitOrdersArr } = useOffersContext();
  const [uniquePairs, setUniquePairs] = useState<string[]>([]);

  useEffect(() => {
    if(limitOrdersArr) {
      setUniquePairs(Array.from(new Set(limitOrdersArr.map(o => o.ticker))))
    }
  }, [limitOrdersArr])

  const isLoading = uniquePairs.length === 0;

    return (
        <div className="flex flex-col">
          <h3 className="text-xl text-center mb-4 lg:mb-6 font-semibold">Available Pairs</h3>
          <div className={`grid grid-cols-1 gap-3 ${!isLoading ? 'sm:grid-cols-2 lg:grid-cols-3' : ''}`}>
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
                      <div className="flex items-center gap-2">
                        <img src={icon1} alt={token1} width="25" height="25" className="rounded-full" />
                        <span>{token1}</span>
                      </div>
                      <span>/</span>
                      <div className="flex items-center gap-2">
                        <img src={icon2} alt={token2} width="25" height="25" className="rounded-full" />
                        <span>{token2}</span>
                      </div>
                    </div>
                  </Card>
                </button>
              )
            }) : (
                <SpinnerLoader color="text-indigo-600" size="50px" height="min-h-[200px]" />
            )}
          </div>
        </div>
    );
};
