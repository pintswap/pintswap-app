import { useAccount } from 'wagmi';
import { MdGroup, MdLineAxis, MdImage, MdTagFaces, MdSwapHoriz } from 'react-icons/md';

export const useDashNav = () => {
    const { address } = useAccount();

    const ICON_SIZE = '20px';
    const NAV_ITEMS = address
        ? [
              {
                  text: 'Swap',
                  route: '/swap',
                  disabled: false,
                  icon: <MdSwapHoriz size={ICON_SIZE} />,
                  tooltip: 'Automatically swap tokens',
              },
              {
                  text: 'Markets',
                  route: '/markets',
                  disabled: false,
                  icon: <MdLineAxis size={ICON_SIZE} />,
                  tooltip: 'See available PintSwap pairs',
              },
              {
                  text: 'NFTs',
                  route: '/nfts',
                  disabled: false,
                  icon: <MdImage size={ICON_SIZE} />,
                  tooltip: 'Coming soon!',
              },
              {
                  text: 'Peers',
                  route: '/peers',
                  disabled: false,
                  icon: <MdGroup size={ICON_SIZE} />,
                  tooltip: 'See who is currently online',
              },
              //   {
              //       text: 'OTC',
              //       route: '/fulfill',
              //       disabled: false,
              //       icon: <MdShare size={ICON_SIZE} />,
              //       tooltip: 'Search for or accept an OTC trade',
              //   },
              {
                  text: 'Account',
                  route: '/account',
                  disabled: false,
                  icon: <MdTagFaces size={ICON_SIZE} />,
                  tooltip: 'User settings',
              },
          ]
        : [
              {
                  text: 'Swap',
                  route: '/swap',
                  disabled: false,
                  icon: <MdSwapHoriz size={ICON_SIZE} />,
                  tooltip: 'Automatically swap tokens',
              },
              {
                  text: 'Markets',
                  route: '/markets',
                  disabled: false,
                  icon: <MdLineAxis size={ICON_SIZE} />,
                  tooltip: 'See available PintSwap pairs',
              },
              {
                  text: 'NFTs',
                  route: '/nfts',
                  disabled: false,
                  icon: <MdImage size={ICON_SIZE} />,
                  tooltip: 'Coming soon!',
              },
              {
                  text: 'Peers',
                  route: '/peers',
                  disabled: false,
                  icon: <MdGroup size={ICON_SIZE} />,
                  tooltip: 'See who is currently publishing offers',
              },
          ];

    return {
        NAV_ITEMS,
    };
};
