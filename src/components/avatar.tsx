import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useGlobalContext, usePeersContext, useUserContext } from "../stores"
import { ethers } from "ethers";
import { formattedPeerName, getPeerData, IUserDataProps, truncate } from "../utils/common";

type IAvatarProps = {
  size?: number | `${string}px`;
  clickable?: boolean;
  peer?: string | IUserDataProps;
  withBio?: boolean;
  withName?: boolean;
  nameClass?: string;
  bioClass?: string;
  align?: 'left' | 'center' | 'right';
  loading?: boolean;
  type?: 'clickable' | 'default' | 'profile'
}

export const Avatar = ({ size = 50, type, peer, withBio, withName, nameClass, bioClass, loading, align }: IAvatarProps) => {
  const { state } = useLocation();
  const { pintswap } = useGlobalContext();
  const { module } = pintswap;
  const { profilePic, bio, shortAddress } = useUserContext();
  const navigate = useNavigate();

  const defaultImgSrc = '/smiley.jpg';
  const defaultUserState = { 
    imgSrc: defaultImgSrc, 
    bio: '', 
    name: peer && typeof peer === 'string' ? peer : truncate(module?.peerId.toB58String() || ethers.constants.AddressZero) 
  }
  const [peerData, setPeerData] = useState<IUserDataProps>(defaultUserState)

  const getUserData = async (): Promise<IUserDataProps> => {
    const baseUrl = `data:image/jpg;base64,`;
    if(peer) {
      if(typeof peer === 'string') {
        const formName = await formattedPeerName(pintswap, peer);
        try {
          const res = await getPeerData(pintswap, peer);
          if(res) {
            return {
              imgSrc: `${baseUrl}${res.image.toString('base64')}`,
              bio: res.bio,
              name: formName
            }
          }
        } catch (err) {
          console.error(`Failed to get peer's (${peer}) avatar\n${err}`);
          return defaultUserState;
        }
      } else return peer;
    }
    if(!profilePic) return defaultUserState;
    else {
      return {
        imgSrc: `${baseUrl}${profilePic?.toString('base64')}`,
        bio,
        name: shortAddress ? shortAddress : truncate(module?.peerId.toB58String() || ethers.constants.AddressZero)
      }
    }
  }

  useEffect(() => {
    console.log("state", state)
    if(state && state.peer) setPeerData(state.peer);
    const getter = async () => {
      const userData = await getUserData();
      setPeerData(userData)
    };
    if(peer && module) getter();
  }, [peer, module]);

  const alginClass = () => {
    switch(align) {
      case 'left': return 'items-start justify-start text-left';
      case 'right': return 'items-end justify-end text-right';
      default: return 'items-center justify-center text-center';
    }
  }
  if(type === 'clickable') {
    return (
      <div className={`${loading ? 'animate-pulse' : ''}`}>
        <button onClick={() => navigate(`/account`)} className={`bg-gradient-to-r from-indigo-600 to-sky-400 p-[2.5px] hover:to-sky-500 rounded-full`}>
          <img
              src={peerData.imgSrc}
              height={size}
              width={size}
              className="rounded-full bg-neutral-900 self-center flex items-center justify-center bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 back transition duration-200 hover:bg-gray"
              alt="Avatar"
          />
        </button>
      </div>
    )
  } else if(type === 'profile') {
    return (
      <div className={loading ? 'animate-pulse' : ''}>
        <div className="float-left">
            {loading ? (
            <div
            className={`rounded-full self-center bg-neutral-800`}
            style={{ minWidth: size, minHeight: size, maxHeight: size, maxWidth: size }}
        />
            ) : (
              <img
              src={peerData.imgSrc}
              height={size}
              width={size}
              className="rounded-full"
              alt="Avatar"
          />
            )}
            </div>
            <div className="flex flex-col pl-3 sm:pl-4">
              <div>
            {withName && loading ? (
            <div
            className={`rounded-md self-center bg-neutral-800`}
            style={{ width: 150, height: 20 }}
        />
              ) : (
                <span className={`${nameClass ? nameClass : "text-lg lg:text-2xl"}`}>
                  {peerData.name?.includes('.drip') ? peerData.name : truncate(peerData.name)}
              </span>
              )}
              </div>
              <div>
          {withBio && loading ? (
            <div
            className={`rounded-md bg-neutral-800`}
            style={{ width: 200, height: 15 }}
        />
              ) : (
              <span className={`${bioClass ? bioClass : "text-sm lg:text-md text-gray-400"}`}>
                {peerData.bio}
              </span>
              )}
              </div>
              </div>
      </div>
    )
  } else {
    return (
      <div className={loading ? 'animate-pulse' : ''}>
        <div className={`flex flex-col gap-3 ${alginClass()}`}>
          <div className={`flex flex-row gap-3 ${alginClass()} !items-center`}>
            {loading ? (
            <div
            className={`rounded-full self-center bg-neutral-800`}
            style={{ minWidth: size, minHeight: size, maxHeight: size, maxWidth: size }}
        />
            ) : (
              <img
              src={peerData.imgSrc}
              height={size}
              width={size}
              className="rounded-full self-center"
              alt="Avatar"
          />
            )}
            {withName && (
              <>
                {loading ? (
            <div
            className={`rounded-md self-center bg-neutral-800`}
            style={{ width: 150, height: 20 }}
        />
              ) : (
                <span className={`${nameClass ? nameClass : "text-lg"}`}>
                  {peerData.name?.includes('.drip') ? peerData.name : truncate(peerData.name)}
              </span>
                )}
              </>
              )}
          </div>
          {withBio && (
            <>
            {loading ? (
            <div
            className={`rounded-md bg-neutral-800`}
            style={{ width: 200, height: 15 }}
        />
              ) : (
              <span className={`${bioClass ? bioClass : "text-sm text-gray-400"}`}>
                {peerData.bio}
              </span>
              )}
              </>
          )}
        </div>
      </div>
    )
  }
}