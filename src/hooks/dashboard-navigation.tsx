import { useAccount } from 'wagmi';
import { MdGroup, MdLineAxis, MdCreate, MdSearch, MdTagFaces, MdSwapHoriz } from 'react-icons/md';

export const useDashNav = () => {
    const { address } = useAccount();

    const ICON_SIZE = '20px';
    const NAV_ITEMS = address
        ? [
              // {
              //     text: 'Swap',
              //     route: '/swap',
              //     disabled: false,
              //     icon: <MdSwapHoriz size={ICON_SIZE} />,
              //     tooltip: '',
              // },
              {
                  text: 'Markets',
                  route: '/markets',
                  disabled: false,
                  icon: <MdLineAxis size={ICON_SIZE} />,
                  tooltip: 'See available pairs',
              },
              {
                  text: 'Peers',
                  route: '/peers',
                  disabled: false,
                  icon: <MdGroup size={ICON_SIZE} />,
                  tooltip: 'See who is currently publishing offers',
              },
              {
                  text: 'Create',
                  route: '/create',
                  disabled: false,
                  icon: <MdCreate size={ICON_SIZE} />,
                  tooltip: 'Create an offer for someone to take',
              },
              {
                  text: 'Fulfill',
                  route: '/fulfill',
                  disabled: false,
                  icon: <MdSearch size={ICON_SIZE} />,
                  tooltip: 'Find a specific trade',
              },
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
                  text: 'Markets',
                  route: '/markets',
                  disabled: false,
                  icon: <MdLineAxis size={ICON_SIZE} />,
                  tooltip: 'See available pairs',
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
