import { useNavigate } from 'react-router-dom';
import { Avatar, Card, Input } from '../components';
import { IUserDataProps, usePeersContext } from '../stores';
import { useSearch } from '../hooks';

export const PeersView = () => {
    const navigate = useNavigate();
    const { peersData, peersLoading, peersError } = usePeersContext();
    const { query, list, handleChange } = useSearch(peersData);

    return (
        <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4 md:mb-6 gap-6">
                <h2 className="view-header mb-0">Peers</h2>
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
                {!peersLoading
                    ? (list as IUserDataProps[]).map((peer, i) => {
                          return (
                              <button
                                  key={`unique-peer-${i}`}
                                  onClick={() => navigate(`/${peer.name}`, { state: { peer } })}
                              >
                                  <Card className="hover:bg-gray-950 h-full">
                                      <Avatar
                                          peer={peer}
                                          size={30}
                                          withName
                                          withBio
                                          withImage={false}
                                          align="left"
                                      />
                                  </Card>
                              </button>
                          );
                      })
                    : [1, 2, 3, 4, 5, 6].map((i) => (
                          <Card key={`loading-card-${i}`} className="justify-start">
                              <Avatar
                                  loading
                                  size={40}
                                  withName
                                  withBio
                                  withImage={false}
                                  align="left"
                              />
                          </Card>
                      ))}
            </div>
        </div>
    );
};
