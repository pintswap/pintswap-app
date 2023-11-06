import { useAccount } from 'wagmi';
import {
    MdGroup,
    MdLineAxis,
    MdImage,
    MdTagFaces,
    MdSwapHoriz,
    MdLock,
    MdCurrencyExchange,
} from 'react-icons/md';

export const useDashNav = () => {
    const { address } = useAccount();

    const ICON_SIZE = '20px';
    const NAV_ITEMS = [
        {
            text: 'Markets',
            route: '/markets',
            disabled: false,
            icon: <MdLineAxis size={ICON_SIZE} />,
            tooltip: 'See available PintSwap pairs',
        },
        {
            text: 'Maker',
            route: '/market-maker',
            disabled: false,
            icon: <MdCurrencyExchange size={ICON_SIZE} />,
            tooltip: 'Make a Market',
        },
        {
            text: 'Create',
            route: '/swap',
            disabled: false,
            icon: <MdSwapHoriz size={ICON_SIZE} />,
            tooltip: 'Broadcast an offer',
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
        {
            text: 'Staking',
            route: '/staking',
            disabled: false,
            icon: <MdLock size={ICON_SIZE} />,
            tooltip: 'Stake your PINT for passive rewards',
        },
    ];

    if (address)
        NAV_ITEMS.push({
            text: 'Account',
            route: '/account',
            disabled: false,
            icon: <MdTagFaces size={ICON_SIZE} />,
            tooltip: 'User settings',
        });

    return {
        NAV_ITEMS,
    };
};
