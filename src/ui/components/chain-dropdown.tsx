import { Button } from './button';
import { useChainModal } from '@rainbow-me/rainbowkit';
import { getNetwork } from '@wagmi/core';
import { MdChevronRight } from 'react-icons/md';
import { useAccount } from 'wagmi';

type IChainDropdown = {
    size?: number;
};

export const ChainDropdown = ({ size = 24 }: IChainDropdown) => {
    const { openChainModal } = useChainModal();
    const { address } = useAccount();
    const getNetworkName = () => {
        if (getNetwork()?.chain && !getNetwork()?.chain?.unsupported) {
            const formattedNetworkName = getNetwork().chain?.name?.toLowerCase();
            if (formattedNetworkName?.includes(' ')) return formattedNetworkName.split(' ')[0];
            return formattedNetworkName;
        }
        if (!address) return 'ethereum';
        return 'unknown';
    };

    return (
        <Button
            onClick={() => (openChainModal ? openChainModal() : {})}
            className={`whitespace-nowrap text-md`}
            type={'transparent'}
        >
            <span className="flex items-center group">
                <img
                    src={`/networks/${getNetworkName()}.svg`}
                    className="group-hover:!fill-neutral-300"
                    alt={`${getNetworkName()} network`}
                    height={size}
                    width={size}
                />
                <MdChevronRight
                    className="rotate-90 group-hover:-translate-y-0.5 group-hover:text-neutral-300 transition-all duration-150 ease-out"
                    size={18}
                />
            </span>
        </Button>
    );
};
