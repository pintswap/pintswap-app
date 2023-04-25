import { useNavigate } from "react-router-dom";
import { Avatar, Card } from "../components";
import { usePeersContext } from "../stores";

export const PeersView = () => {
  const navigate = useNavigate();
  const { peersData, peersLoading, peersError } = usePeersContext();

  return (
      <div className="flex flex-col">
        <h3 className="view-header">Available Peers</h3>
        <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3`}>
          {!peersLoading ? peersData.map((peer, i) => {
            return (
              <button key={`unique-peer-${i}`} onClick={() => navigate(`/${peer.name}`, { state: { peer }})}>
                <Card className="hover:bg-gray-950">
                      <Avatar 
                        peer={peer} 
                        size={30} 
                        withName
                        withBio
                        align="left"
                      />
                </Card>
              </button>
            )
          }) : [1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={`loading-card-${i}`} className="justify-start">
                  <Avatar 
                    loading
                    size={40} 
                    withName
                    withBio
                    align="left"
                  />
                </Card>
            ))}
        </div>
      </div>
  );
};
