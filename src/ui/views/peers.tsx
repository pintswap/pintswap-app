import { useNavigate } from 'react-router-dom';
import { Button, Card, GradientBorder, Header, Input } from '../components';
import { Avatar } from '../features';
import { IUserDataProps, useOffersContext, usePeersContext } from '../../stores';
import { useSearch } from '../../hooks';
import { useMemo } from 'react';

export const PeersView = () => {
    const navigate = useNavigate();
    const { peersData, peersLoading, peersError } = usePeersContext();
    const { query, list, handleChange } = useSearch(peersData);

    const memoizedList = useMemo(() => list, [list.length]);

    return (
        <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2.5 lg:mb-3 gap-6">
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
                className={
                    !peersLoading && !memoizedList?.length
                        ? 'flex flex-col justify-center items-center gap-3 w-full h-[50vh]'
                        : `grid grid-cols-1 gap-1 md:gap-1.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5`
                }
            >
                {!peersLoading ? (
                    memoizedList?.length ? (
                        (memoizedList as IUserDataProps[]).map((peer, i) => {
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
                    ) : (
                        <>
                            <span className="lg:text-lg">No active peers</span>
                            <Button onClick={() => navigate('/create')}>Create a trade</Button>
                        </>
                    )
                ) : (
                    [1, 2, 3, 4, 5, 6].map((i) => (
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
                    ))
                )}
            </div>
        </div>
    );
};
