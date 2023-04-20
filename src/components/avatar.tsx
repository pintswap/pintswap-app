import { useNavigate } from "react-router-dom";
import { useUserContext } from "../stores"

type IAvatarProps = {
  size?: number | `${string}px`;
  clickable?: boolean;
}

export const Avatar = ({ size = 50, clickable }: IAvatarProps) => {
  const { profilePic } = useUserContext();
  const navigate = useNavigate();

  if(clickable) {
    return (
      <button onClick={() => navigate(`/account`)} className={`bg-gradient-to-r from-indigo-600 to-sky-400 p-[2.5px] hover:to-sky-500 rounded-full`}>
        <img
            src={profilePic ? `data:image/jpg;base64,${profilePic?.toString('base64')}` : '/smiley.jpg'}
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
        src={profilePic ? `data:image/jpg;base64,${profilePic?.toString('base64')}` : '/smiley.jpg'}
        height={size}
        width={size}
        className="rounded-full self-center"
        alt="Avatar"
    />
  )
}