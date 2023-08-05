import { useAccount } from 'wagmi';
import { MdGroup, MdLineAxis, MdCreate, MdSearch, MdTagFaces } from 'react-icons/md';

export const useDashNav = () => {
    const { address } = useAccount();

    const ICON_SIZE = '20px';
    const NAV_ITEMS = address
        ? [
              {
                  text: 'Markets',
                  route: '/markets',
                  disabled: false,
                  icon: <MdLineAxis size={ICON_SIZE} />,
              },
              // { text: 'Pairs', route: '/pairs', disabled: false, icon: <BiDonateBlood size={ICON_SIZE} /> },
              {
                  text: 'Peers',
                  route: '/peers',
                  disabled: false,
                  icon: <MdGroup size={ICON_SIZE} />,
              },
              {
                  text: 'Create',
                  route: '/create',
                  disabled: false,
                  icon: <MdCreate size={ICON_SIZE} />,
              },
              {
                  text: 'Fulfill',
                  route: '/fulfill',
                  disabled: false,
                  icon: <MdSearch size={ICON_SIZE} />,
              },
              {
                  text: 'Account',
                  route: '/account',
                  disabled: false,
                  icon: <MdTagFaces size={ICON_SIZE} />,
              },
          ]
        : [
              {
                  text: 'Markets',
                  route: '/markets',
                  disabled: false,
                  icon: <MdLineAxis size={ICON_SIZE} />,
              },
              // { text: 'Pairs', route: '/pairs', disabled: false, icon: <BiDonateBlood size={ICON_SIZE} /> },
              {
                  text: 'Peers',
                  route: '/peers',
                  disabled: false,
                  icon: <MdGroup size={ICON_SIZE} />,
              },
          ];

    return {
        NAV_ITEMS,
    };
};
