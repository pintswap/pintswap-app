import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalContext, useUserContext } from "../stores"
import { createFromB58String } from "peer-id";

type IAvatarProps = {
  size?: number | `${string}px`;
  clickable?: boolean;
  peer?: string;
}

export const Avatar = ({ size = 50, clickable, peer }: IAvatarProps) => {
  const { pintswap: { module } } = useGlobalContext();
  const { profilePic } = useUserContext();
  const navigate = useNavigate();
  const [imgSrc, setImgSrc] = useState('/smiley.jpg');

  const getUrl = async () => {
    const baseUrl = `data:image/jpg;base64,`;
    const defaultUrl = '/smiley.jpg';
    if(peer && module) {
      try {
        let formattedPeerAddress;
        if(peer.includes('.drip')) {
          formattedPeerAddress = await module.resolveName(peer)
        } else {
          formattedPeerAddress = peer;
        }
        console.log(createFromB58String(formattedPeerAddress).toB58String())
        const res = await module?.getUserDataByPeerId(createFromB58String(formattedPeerAddress).toB58String());
        console.log(res);
        if(res?.image) return `${baseUrl}${res.image.toString('base64')}`
      } catch (err) {
        console.warn(`Failed to get peer's (${peer}) avatar\n${err}`);
        return defaultUrl;
      }
    }
    if(!profilePic) return defaultUrl;
    else {
      return `${baseUrl}${profilePic?.toString('base64')}`
    }
  }

  useEffect(() => {
    const getter = async () => {
      const avatarUrl = await getUrl();
      setImgSrc(avatarUrl)
    };
    if(module) getter();
  }, [module]);

  if(clickable) {
    return (
      <button onClick={() => navigate(`/account`)} className={`bg-gradient-to-r from-indigo-600 to-sky-400 p-[2.5px] hover:to-sky-500 rounded-full`}>
        <img
            src={imgSrc}
            height={size}
            width={size}
            className="rounded-full self-center flex items-center justify-center bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 back transition duration-200 hover:bg-gray"
            alt="Avatar"
        />
      </button>
    )
  }
  return (
    <img
        src={imgSrc}
        height={size}
        width={size}
        className="rounded-full self-center"
        alt="Avatar"
    />
  )
}