import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { IUserDataProps, usePintswapContext, usePeersContext, useUserContext } from '../stores';
import { BASE_AVATAR_URL, DEFAULT_AVATAR, getFormattedPeer, getPeerImg, truncate } from '../utils';
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
        bio: pathname.includes('account') ? (userData.bio ? userData.bio : '') : '',
        name: peer && typeof peer === 'string' ? peer : truncate(userData.name),
        active: false,
    };
    const [peerData, setPeerData] = useState<IUserDataProps>(defaultUserState);

    const getUserData = async (): Promise<IUserDataProps | undefined> => {
        if (module) {
            if (peer) {
                if (typeof peer === 'string') {
                    // Passed peer string
                    const found = peersData.find(
                        (el) => el.name.toLowerCase() === peer.toLowerCase(),
                    );
                    console.log('found', found);
                    if (found) {
                        if ((found.img === '' || found.img === '/black.jpg') && multiaddr) {
                            return {
                                ...found,
                                img: await getPeerImg(pintswap, peer),
                            };
                        }
                        return found;
                    } else {
                        const formattedPeer = await getFormattedPeer(
                            pintswap,
                            peer,
                            withImage ? 'full' : 'minimal',
                        );
                        console.log('formattedPeer', formattedPeer);
                        if (formattedPeer) {
                            // If current user
                            if (peer === module.peerId.toB58String()) setUserData(formattedPeer);
                            return formattedPeer;
                        }
                    }
                } else {
                    // Passed entire peer obj
                    if ((peer.img === '' || peer.img === '/black.jpg') && multiaddr) {
                        console.log('passing entire', peer);
                        return {
                            ...peer,
                            img: await getPeerImg(pintswap, peer),
                        };
                    }
                    return peer;
                }
            } else {
                // Passed no peer / user data
                const renderName = userData.name
                    ? userData.name
                    : truncate(module.peerId.toB58String());
                const renderPic =
                    userData.img?.toString('base64') !== ''
                        ? `${BASE_AVATAR_URL}${userData.img?.toString('base64')}`
                        : DEFAULT_AVATAR;
                return {
                    ...userData,
                    img: renderPic,
                    bio: userData.bio,
                    name: renderName,
                };
            }
        }
    };

    useEffect(() => {
        const getter = async () => {
            const userData = await getUserData();
            if (userData) setPeerData(userData);
            else setPeerData(defaultUserState);
        };
        getter();
    }, [peer, module, peerData.name, peersData.length]);

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
            <div className={loading ? 'animate-pulse' : ''}>
                <div className="float-left">
                    {loading ? (
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
                        {loading ? (
                            <div
                                className={`rounded-md self-center bg-neutral-700`}
                                style={{ width: 150, height: 20 }}
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
                        {loading ? (
                            <div
                                className={`rounded-md bg-neutral-700`}
                                style={{ width: 200, height: 15 }}
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
            <div className={loading ? 'animate-pulse' : ''}>
                <div className={`flex flex-col gap-3 ${alginClass()}`}>
                    <div className={`flex flex-row gap-3 ${alginClass()} !items-center`}>
                        {withImage && (
                            <>
                                {loading ? (
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
                                {loading ? (
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
                            {loading ? (
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
