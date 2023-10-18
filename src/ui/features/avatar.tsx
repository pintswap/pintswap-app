import { useEffect, useState } from 'react';
import { IUserDataProps, usePintswapContext, usePeersContext, useUserContext } from '../../stores';
import {
    DEFAULT_AVATAR,
    formatPeerImg,
    formatPeerName,
    getFormattedPeer,
    getPeerImg,
    truncate,
} from '../../utils';
import { StatusIndicator } from '../components/status-indicator';
import { PintP2P } from '@pintswap/sdk/lib/p2p';

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
    direction?: 'horizontal' | 'vertical';
    ring?: boolean;
    ringColor?: `bg-${string}`;
    imgShape?: 'square' | 'circle';
    truncated?: boolean;
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
    direction = 'horizontal',
    ring,
    imgShape = 'circle',
    truncated,
    ringColor,
}: IAvatarProps) => {
    const { pintswap } = usePintswapContext();
    const { module } = pintswap;
    const { userData, setUserData } = useUserContext();
    const { peersData } = usePeersContext();

    const peerName = typeof peer === 'string' ? peer : peer?.name;
    const isUser = peerName === module?.address;

    const alignClass = () => {
        switch (align) {
            case 'left':
                return 'items-start justify-start text-left';
            case 'right':
                return 'items-end justify-end text-right';
            default:
                return 'items-center justify-center text-center';
        }
    };

    const defaultUserState = isUser
        ? userData
        : {
              img: DEFAULT_AVATAR,
              bio: '',
              name: '',
              address: '',
              active: false,
              loading: true,
          };

    const [peerData, setPeerData] = useState<IUserDataProps>(defaultUserState);

    const getUserData = async (): Promise<IUserDataProps> => {
        if (module && peer && peerName) {
            const found = peersData.find((el) => el.name === peerName);
            if (found) {
                const img = withImage ? await getPeerImg(pintswap, peer) : found.img;
                const returnObj = {
                    ...found,
                    active: isUser ? userData.active : found.active,
                    address: await formatPeerName(pintswap, peerName, true),
                    privateKey: isUser ? userData.privateKey : found.privateKey,
                    img,
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
                const img = withImage ? await getPeerImg(pintswap, peer) : formattedPeer.img;
                const returnObj = {
                    ...formattedPeer,
                    active: isUser ? userData.active : formattedPeer.active,
                    name: await formatPeerName(pintswap, peerName),
                    address: await formatPeerName(pintswap, peerName, true),
                    privateKey: isUser ? userData.privateKey : formattedPeer.privateKey,
                    img,
                    loading: false,
                };
                if (isUser) {
                    setUserData({
                        name: returnObj.name === module.address ? '' : returnObj.name,
                        ...returnObj,
                        ...module.userData,
                    });
                }
                return returnObj;
            }
        }
        return defaultUserState;
    };

    useEffect(() => {
        const getter = async () => {
            const userData = await getUserData();
            if (userData) setPeerData(userData);
        };
        if (module) getter();
    }, [peer, module, peerData.name, peersData.length]);

    useEffect(() => {
        setPeerData({
            ...peerData,
            name: userData.name,
            bio: userData.bio,
            img: userData.img,
        });
    }, [userData.name, userData.bio, userData.img]);

    if (type === 'clickable') {
        return (
            <div className={`${loading ? 'animate-pulse' : ''}`}>
                <a
                    href={
                        peerData.name === module?.address || peer === module?.address
                            ? `/#/account`
                            : `/#/peers/${peerData.name}`
                    }
                >
                    <button
                        className={`${
                            ringColor
                                ? ringColor
                                : 'bg-gradient-to-r from-accent-light to-primary p-[2.5px] hover:opacity-80 transition duration-150'
                        } ${imgShape === 'square' ? 'rounded' : 'rounded-full'}`}
                    >
                        {showActive && <StatusIndicator active={userData.active} />}
                        <img
                            src={(peerData.img as string) || DEFAULT_AVATAR}
                            height={size}
                            width={size}
                            style={{
                                minWidth: size,
                                minHeight: size,
                                maxHeight: size,
                                maxWidth: size,
                            }}
                            className={` ${
                                imgShape === 'square' ? 'rounded' : 'rounded-full'
                            } bg-brand-dashboard object-cover self-center flex items-center justify-center bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 back transition duration-200 hover:bg-gray`}
                            alt="Avatar"
                        />
                    </button>
                </a>
                {withName && (
                    <div className={`${truncated ? 'max-w-[160px] truncate' : ''}`}>
                        <span
                            className={`${nameClass ? nameClass : 'text-lg lg:text-xl'} ${
                                truncated ? 'text-ellipsis' : ''
                            }`}
                        >
                            {peerData.name?.includes('.drip')
                                ? peerData.name
                                : truncate(PintP2P.toAddress(peerData.name))}
                        </span>
                    </div>
                )}
            </div>
        );
    } else if (type === 'profile') {
        return (
            <div className={loading || peerData.loading ? 'animate-pulse' : ''}>
                <div className="float-left">
                    {loading || peerData.loading ? (
                        <div
                            className={` ${
                                imgShape === 'square' ? 'rounded' : 'rounded-full'
                            } self-center bg-neutral-900`}
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
                                src={(peerData.img as string) || DEFAULT_AVATAR}
                                height={size}
                                width={size}
                                style={{
                                    minWidth: size,
                                    minHeight: size,
                                    maxHeight: size,
                                    maxWidth: size,
                                }}
                                className={`${
                                    imgShape === 'square' ? 'rounded' : 'rounded-full'
                                } self-center object-cover bg-neutral-100 min-h-[60px] min-w-[60px]`}
                                alt="Avatar"
                            />
                        </>
                    )}
                </div>
                <div className={`flex flex-col pl-3 sm:pl-4 ${alignClass()}`}>
                    <div>
                        {loading || peerData.loading ? (
                            <div
                                className={`rounded-md self-center bg-neutral-900 mt-0.5`}
                                style={{ width: 150, height: 30 }}
                            />
                        ) : (
                            <span className={`${nameClass ? nameClass : 'text-lg lg:text-2xl'}`}>
                                {peerData.name?.includes('.drip')
                                    ? peerData.name
                                    : truncate(PintP2P.toAddress(peerData.name))}
                            </span>
                        )}
                    </div>
                    <div>
                        {loading || peerData.loading ? (
                            <div
                                className={`rounded-md bg-neutral-900 mt-1`}
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
                <div className={`flex flex-col gap-1 ${alignClass()}`}>
                    <div
                        className={`flex ${
                            direction === 'horizontal' ? 'flex-row' : 'flex-col'
                        } gap-3 ${alignClass()} !items-center`}
                    >
                        {withImage && (
                            <>
                                {loading || peerData.loading ? (
                                    <div
                                        className={` ${
                                            imgShape === 'square' ? 'rounded' : 'rounded-full'
                                        } self-center bg-neutral-900`}
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
                                            src={(peerData.img as string) || DEFAULT_AVATAR}
                                            height={size}
                                            width={size}
                                            style={{
                                                minHeight: size,
                                                maxHeight: size,
                                                minWidth: size,
                                                maxWidth: size,
                                            }}
                                            className={`${
                                                imgShape === 'square' ? 'rounded' : 'rounded-full'
                                            } ${
                                                align === 'left' ? 'self-start' : 'self-center'
                                            } bg-neutral-100 ${
                                                ring ? 'border-2 border-white' : ''
                                            } object-cover`}
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
                                        className={`rounded-md self-center bg-neutral-900`}
                                        style={{ width: 150, height: 20 }}
                                    />
                                ) : (
                                    <span className={`${nameClass ? nameClass : 'text-lg'}`}>
                                        {peerData.name?.includes('.drip')
                                            ? peerData.name
                                            : truncate(PintP2P.toAddress(peerData.name))}
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                    {withBio && (
                        <>
                            {loading || peerData.loading ? (
                                <div
                                    className={`rounded-md bg-neutral-900`}
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
