import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { IUserDataProps, usePintswapContext, usePeersContext, useUserContext } from '../stores';
import {
    BASE_AVATAR_URL,
    DEFAULT_AVATAR,
    formatPeerImg,
    formatPeerName,
    getFormattedPeer,
    getPeerImg,
    truncate,
} from '../utils';
import { StatusIndicator } from './status-indicator';

type IAvatarProps = {
    size?: number | `${string}px` | 'full';
    clickable?: boolean;
    peer?: string | IUserDataProps;
    withBio?: boolean;
    withName?: boolean;
    withImage?: boolean;
    showActive?: boolean;
    nameClass?: string;
    bioClass?: string;
    align?: 'left' | 'center' | 'right';
    loading?: boolean;
    type?: 'clickable' | 'default' | 'profile';
};

export const Avatar = ({
    size = 50,
    withImage = true,
    type,
    peer,
    withBio,
    withName,
    nameClass,
    bioClass,
    loading,
    align,
    showActive,
}: IAvatarProps) => {
    const { pathname } = useLocation();
    const { pintswap } = usePintswapContext();
    const { module } = pintswap;
    const { userData, setUserData } = useUserContext();
    const { peersData } = usePeersContext();
    const navigate = useNavigate();
    const { multiaddr } = useParams();

    const defaultUserState = {
        img: DEFAULT_AVATAR,
        bio: '',
        name: '',
        active: false,
        loading: true,
    };
    const [peerData, setPeerData] = useState<IUserDataProps>(defaultUserState);

    const getUserData = async (): Promise<IUserDataProps> => {
        if (module && peer) {
            const peerName = typeof peer === 'string' ? peer : peer.name;
            const found = peersData.find((el) => el.name === peerName);
            if (found) {
                const returnObj = {
                    ...found,
                    img: await getPeerImg(pintswap, peer),
                    name: await formatPeerName(pintswap, peerName),
                    loading: false,
                };

                return returnObj;
            }
            const formattedPeer = await getFormattedPeer(
                pintswap,
                peerName,
                withImage ? 'full' : 'minimal',
            );
            if (formattedPeer) {
                const returnObj = {
                    ...formattedPeer,
                    name: await formatPeerName(pintswap, peerName),
                    img: await getPeerImg(pintswap, peer),
                    loading: false,
                };
                if (peer === module.peerId.toB58String()) setUserData(returnObj);
                return returnObj;
            }
            return defaultUserState;
            // if (typeof peer === 'string') {
            //     const found = peersData.find((el) => el.name === peer);
            //     if (found) {
            //         return {
            //             ...found,
            //             img: await getPeerImg(pintswap, peer),
            //             name: await formatPeerName(pintswap, peer),
            //             loading: false,
            //         };
            //     }
            //     const formattedPeer = await getFormattedPeer(
            //         pintswap,
            //         peer,
            //         withImage ? 'full' : 'minimal',
            //     );
            //     if (formattedPeer) {
            //         const returnObj = {
            //             ...formattedPeer,
            //             name: await formatPeerName(pintswap, peer),
            //             img: await getPeerImg(pintswap, peer),
            //             loading: false,
            //         };
            //         if (peer === module.peerId.toB58String()) setUserData(returnObj);
            //         return returnObj;
            //     }
            //     return defaultUserState;
            // } else {
            //     return {
            //         ...peer,
            //         name: await formatPeerName(pintswap, peer.name),
            //         img: await getPeerImg(pintswap, peer.name),
            //         loading: false,
            //     };
            // }
        } else {
            return defaultUserState;
        }
    };

    useEffect(() => {
        const getter = async () => {
            const userData = await getUserData();
            if (userData) setPeerData(userData);
        };
        if (module) getter();
    }, [peer, module]);

    const alginClass = () => {
        switch (align) {
            case 'left':
                return 'items-start justify-start text-left';
            case 'right':
                return 'items-end justify-end text-right';
            default:
                return 'items-center justify-center text-center';
        }
    };

    if (type === 'clickable') {
        return (
            <div className={`${loading ? 'animate-pulse' : ''}`}>
                <button
                    onClick={() => navigate(`/account`)}
                    className={`bg-gradient-to-r from-indigo-600 to-sky-400 p-[2.5px] hover:to-sky-500 rounded-full`}
                >
                    {showActive && <StatusIndicator active={userData.active} />}
                    <img
                        src={peerData.img as string}
                        height={size}
                        width={size}
                        className="rounded-full bg-neutral-900 self-center flex items-center justify-center bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 back transition duration-200 hover:bg-gray"
                        alt="Avatar"
                    />
                </button>
            </div>
        );
    } else if (type === 'profile') {
        return (
            <div className={loading || peerData.loading ? 'animate-pulse' : ''}>
                <div className="float-left">
                    {loading || peerData.loading ? (
                        <div
                            className={`rounded-full self-center bg-neutral-700`}
                            style={{
                                minWidth: size,
                                minHeight: size,
                                maxHeight: size,
                                maxWidth: size,
                            }}
                        />
                    ) : (
                        <>
                            {showActive && <StatusIndicator active={userData.active} />}
                            <img
                                src={peerData.img as string}
                                height={size}
                                width={size}
                                className="rounded-full self-center bg-neutral-100"
                                alt="Avatar"
                            />
                        </>
                    )}
                </div>
                <div className="flex flex-col pl-3 sm:pl-4">
                    <div>
                        {loading || peerData.loading ? (
                            <div
                                className={`rounded-md self-center bg-neutral-700 mt-0.5`}
                                style={{ width: 150, height: 30 }}
                            />
                        ) : (
                            <span className={`${nameClass ? nameClass : 'text-lg lg:text-2xl'}`}>
                                {peerData.name?.includes('.drip')
                                    ? peerData.name
                                    : truncate(peerData.name)}
                            </span>
                        )}
                    </div>
                    <div>
                        {loading || peerData.loading ? (
                            <div
                                className={`rounded-md bg-neutral-700 mt-1`}
                                style={{ width: 200, height: 20 }}
                            />
                        ) : (
                            <span
                                className={`${
                                    bioClass ? bioClass : 'text-sm lg:text-md text-gray-400'
                                }`}
                            >
                                {peerData.bio}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        );
    } else {
        return (
            <div className={loading || peerData.loading ? 'animate-pulse' : ''}>
                <div className={`flex flex-col gap-3 ${alginClass()}`}>
                    <div className={`flex flex-row gap-3 ${alginClass()} !items-center`}>
                        {withImage && (
                            <>
                                {loading || peerData.loading ? (
                                    <div
                                        className={`rounded-full self-center bg-neutral-700`}
                                        style={{
                                            minWidth: size,
                                            minHeight: size,
                                            maxHeight: size,
                                            maxWidth: size,
                                        }}
                                    />
                                ) : (
                                    <>
                                        {showActive && <StatusIndicator active={userData.active} />}
                                        <img
                                            src={peerData.img as string}
                                            height={size}
                                            width={size}
                                            className="rounded-full self-center bg-neutral-100"
                                            alt="Avatar"
                                        />
                                    </>
                                )}
                            </>
                        )}
                        {withName && (
                            <>
                                {loading || peerData.loading ? (
                                    <div
                                        className={`rounded-md self-center bg-neutral-700`}
                                        style={{ width: 150, height: 20 }}
                                    />
                                ) : (
                                    <span className={`${nameClass ? nameClass : 'text-lg'}`}>
                                        {peerData.name?.includes('.drip')
                                            ? peerData.name
                                            : truncate(peerData.name)}
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                    {withBio && (
                        <>
                            {loading || peerData.loading ? (
                                <div
                                    className={`rounded-md bg-neutral-700`}
                                    style={{ width: 200, height: 15 }}
                                />
                            ) : (
                                <span
                                    className={`${bioClass ? bioClass : 'text-sm text-gray-400'}`}
                                >
                                    {peerData.bio}
                                </span>
                            )}
                        </>
                    )}
                </div>
            </div>
        );
    }
};
