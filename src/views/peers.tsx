import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Card, SpinnerLoader } from "../components";
import { useOffersContext } from "../stores";

export const PeersView = () => {
  const navigate = useNavigate();
  const { limitOrdersArr } = useOffersContext();
  const [uniquePeers, setUniquePeers] = useState<any[]>([]);

  useEffect(() => {
    if(limitOrdersArr) {
      const peerAddresses = Array.from(new Set(limitOrdersArr.map(o => o.peer)))
      setUniquePeers(peerAddresses)
    }
  }, [limitOrdersArr])

  const isLoading = uniquePeers.length === 0;

    return (
        <div className="flex flex-col">
          <h3 className="text-xl text-center mb-4 lg:mb-6 font-semibold">Available Peers</h3>
          <div className={`grid grid-cols-1 gap-3 ${!isLoading ? 'sm:grid-cols-2 lg:grid-cols-3' : ''}`}>
            {!isLoading ? uniquePeers.map(peer => {
              return (
                <button key={`unique-peer-${peer}`} onClick={() => navigate(`/peers/${peer}`)}>
                  <Card className="hover:bg-gray-900">
                    <div className={`text-center flex items-center justify-center gap-3`}>
                      <div className="flex items-center gap-3">
                        <Avatar peer={peer} size={25} />
                        <span className="text-lg">{peer}</span>
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
