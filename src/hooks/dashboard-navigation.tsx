import { useAccount } from "wagmi";
import { BiDrink, BiHappyAlt, BiDonateBlood, BiRun, BiShapeCircle, BiWind, BiUserPlus } from "react-icons/bi";

export const useDashNav = () => {
  const { address } = useAccount();

  const ICON_SIZE = '20px';
  const NAV_ITEMS = address ? [
      { text: 'Explore', route: '/explore', disabled: false, icon: <BiDrink size={ICON_SIZE} /> },
      { text: 'Pairs', route: '/pairs', disabled: false, icon: <BiDonateBlood size={ICON_SIZE} /> },
      { text: 'Peers', route: '/peers', disabled: false, icon: <BiShapeCircle size={ICON_SIZE} /> },
      { text: 'Create', route: '/create', disabled: false, icon: <BiRun size={ICON_SIZE} /> },
      { text: 'Fulfill', route: '/fulfill', disabled: false, icon: <BiWind size={ICON_SIZE} /> },
      { text: 'Account', route: '/account', disabled: false, icon: <BiHappyAlt size={ICON_SIZE} /> },
  ] : [
      { text: 'Explore', route: '/explore', disabled: false, icon: <BiDrink size={ICON_SIZE} /> },
      { text: 'Pairs', route: '/pairs', disabled: false, icon: <BiDonateBlood size={ICON_SIZE} /> },
      { text: 'Peers', route: '/peers', disabled: false, icon: <BiShapeCircle size={ICON_SIZE} /> },
  ]

  return {
    NAV_ITEMS
  }
}