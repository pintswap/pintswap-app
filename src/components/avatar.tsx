import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalContext, useUserContext } from "../stores"
import { createFromB58String } from "peer-id";
import { ethers } from "ethers";
import { truncate } from "../utils/common";

type IAvatarProps = {
  size?: number | `${string}px`;
  clickable?: boolean;
  peer?: string;
  withBio?: boolean;
  withName?: boolean;
}

type IUserDataProps = {
  imgSrc: string;
  bio: string;
  name: string;
}

export const Avatar = ({ size = 50, clickable, peer, withBio, withName }: IAvatarProps) => {
  const { pintswap: { module } } = useGlobalContext();
  const { profilePic, bio, shortAddress } = useUserContext();
  const navigate = useNavigate();

  const defaultImgSrc = '/smiley.jpg';
  const defaultUserState = { 
    imgSrc: defaultImgSrc, 
    bio: '', 
    name: peer ? peer : truncate(module?.peerId.toB58String() || ethers.constants.AddressZero) 
  }
  const [peerData, setPeerData] = useState<IUserDataProps>(defaultUserState)

  const getUserData = async (): Promise<IUserDataProps> => {
    const baseUrl = `data:image/jpg;base64,`;
    if(peer && module) {
      try {
        let formattedPeerAddress;
        if(peer.includes('.drip')) {
          formattedPeerAddress = await module.resolveName(peer)
        } else {
          formattedPeerAddress = peer;
        }
        const b58peer = createFromB58String(formattedPeerAddress).toB58String();
        const res = await module?.getUserDataByPeerId(b58peer);
        if(res) {
          return {
            imgSrc: `${baseUrl}${res.image.toString('base64')}`,
            bio: res.bio,
            name: peer.includes('.drip') ? peer : truncate(b58peer)
          }
        }
      } catch (err) {
        console.error(`Failed to get peer's (${peer}) avatar\n${err}`);
        return defaultUserState;
      }
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
    const getter = async () => {
      const userData = await getUserData();
      setPeerData(userData)
    };
    if(module) getter();
  }, [module]);

  if(clickable) {
    return (
      <button onClick={() => navigate(`/account`)} className={`bg-gradient-to-r from-indigo-600 to-sky-400 p-[2.5px] hover:to-sky-500 rounded-full`}>
        <img
            src={peerData.imgSrc}
            height={size}
            width={size}
            className="rounded-full self-center flex items-center justify-center bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 back transition duration-200 hover:bg-gray"
            alt="Avatar"
        />
      </button>
    )
  }
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex flex-col md:flex-row gap-2">
        <img
            src={peerData.imgSrc}
            height={size}
            width={size}
            className="rounded-full self-center"
            alt="Avatar"
        />
        {withName && <span className="text-lg">{peerData.name.includes('.drip') ? peerData.name : truncate(peerData.name)}</span>}
      </div>
      {withBio && peerData.bio && <span className="text-sm text-gray-400">{peerData.bio}</span>}
    </div>
  )
}