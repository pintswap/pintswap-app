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
        if (getNetwork()?.chain && !getNetwork()?.chain?.unsupported) {
            const formattedNetworkName = getNetwork().chain?.name?.toLowerCase();
            console.log(formattedNetworkName);
            if (formattedNetworkName?.includes(' ')) return formattedNetworkName.split(' ')[0];
            return formattedNetworkName;
        }
        return 'unknown';
    };

    return (
        <Button
            onClick={() => (openChainModal ? openChainModal() : {})}
            className={`whitespace-nowrap text-md`}
            type={'wallet'}
        >
            <img
                src={`/networks/${getNetworkName()}.svg`}
                alt={`${getNetworkName()} network`}
                height={size}
                width={size}
            />
        </Button>
    );
};
