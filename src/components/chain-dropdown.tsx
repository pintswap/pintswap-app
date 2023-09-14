import { Button } from './button';
import { useChainModal } from '@rainbow-me/rainbowkit';
import { getNetwork } from '@wagmi/core';
import { DEFAULT_NETWORK } from '../utils';

type IChainDropdown = {
    size?: number;
};

export const ChainDropdown = ({ size = 24 }: IChainDropdown) => {
    const { openChainModal } = useChainModal();
    const getNetworkName = () => {
        if (getNetwork()?.chain) {
            const formattedNetworkName = getNetwork().chain?.name?.toLowerCase();
            if (formattedNetworkName?.includes(' ')) return formattedNetworkName.split(' ')[0];
            return formattedNetworkName;
        }
        return DEFAULT_NETWORK;
    };

    return (
        <Button
            onClick={() => (openChainModal ? openChainModal() : {})}
            className={`whitespace-nowrap text-md`}
            type={'wallet'}
        >
            <img
                src={`/networks/${getNetworkName()}.svg`}
                alt={getNetworkName()}
                height={size}
                width={size}
            />
        </Button>
    );
};
