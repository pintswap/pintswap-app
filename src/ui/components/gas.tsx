import { MdLocalGasStation } from 'react-icons/md';
import { useFeeData } from 'wagmi';
import { formatUnits } from 'ethers6';
import { getChainId } from '../../utils';

type IGas = {
    size?: number;
    className?: string;
};

export const Gas = ({ size, className }: IGas) => {
    const chainId = getChainId();
    const { data, isError, isLoading } = useFeeData();
    if (isError || isLoading) return <></>;

    const formatGasPrice = () => {
        if (data?.formatted?.gasPrice && data?.formatted?.gasPrice?.length > 9) {
            return Math.round(Number(formatUnits(data?.formatted?.gasPrice || '0', 9)));
        }
        return formatUnits(data?.formatted?.gasPrice || '0', 9);
    };

    const renderUnits = () => {
        if (chainId === 43114) return 'nAVAX';
        return 'gwei';
    };

    return (
        <div className="flex flex-col mt-1 cursor-default">
            <div className={`flex items-center gap-0.5 leading-3 ${className || ''}`}>
                <MdLocalGasStation size={size || ''} />
                <span className="">{formatGasPrice()}</span>
            </div>
            <span className="text-[10px] text-neutral-400 leading-3">{renderUnits()}</span>
        </div>
    );
};
