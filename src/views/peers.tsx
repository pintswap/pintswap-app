import { useNavigate } from 'react-router-dom';
import { Avatar, Card, GradientBorder, Header, Input } from '../components';
import { IUserDataProps, usePeersContext } from '../stores';
import { useSearch } from '../hooks';

export const PeersView = () => {
    const navigate = useNavigate();
    const { peersData, peersLoading, peersError } = usePeersContext();
    const { query, list, handleChange } = useSearch(peersData);

    return (
        <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4 md:mb-6 gap-6">
                <Header breadcrumbs={[{ text: 'Peers', link: '/peers' }]}>Active Peers</Header>
                <Input
                    value={query}
                    onChange={handleChange}
                    type="search"
                    wrapperClass="max-w-[200px] sm:max-w-[250px] md:max-w-[300px] lg:max-w-[350px]"
                    noSpace
                />
            </div>
            <div
                className={`grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5`}
            >
                {!peersLoading
                    ? (list as IUserDataProps[]).map((peer, i) => {
                          return (
                              <button
                                  key={`unique-peer-${i}`}
                                  onClick={() =>
                                      navigate(`/peers/${peer.name}`, { state: { peer } })
                                  }
                              >
                                  <GradientBorder className="rounded-lg from-transparent to-transparent h-full">
                                      <Card className="h-full">
                                          <Avatar
                                              peer={peer}
                                              size={30}
                                              withName
                                              withBio
                                              withImage={false}
                                              align="left"
                                          />
                                      </Card>
                                  </GradientBorder>
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
