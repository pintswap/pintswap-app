import { MdLocalGasStation } from 'react-icons/md';
import { useFeeData } from 'wagmi';
import { formatUnits } from 'ethers6';

type IGas = {
    size?: number;
    className?: string;
    units?: 'gwei';
};

export const Gas = ({ size, className, units }: IGas) => {
    const { data, isError, isLoading } = useFeeData();
    if (isError || isLoading) return <></>;

    const formatGasPrice = () => {
        if (data?.formatted?.gasPrice && data?.formatted?.gasPrice?.length > 9) {
            return Math.round(Number(formatUnits(data?.formatted?.gasPrice || '0', 9)));
        }
        return formatUnits(data?.formatted?.gasPrice || '0', 9);
    };

    return (
        <div className="flex flex-col mt-1 cursor-default">
            <div className={`flex items-center gap-0.5 leading-3 ${className || ''}`}>
                <MdLocalGasStation size={size || ''} />
                <span className="">{formatGasPrice()}</span>
            </div>
            {units && <span className="text-[10px] text-neutral-400 leading-3">{units}</span>}
        </div>
    );
};
