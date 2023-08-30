import { MdLocalGasStation } from 'react-icons/md';
import { useFeeData } from 'wagmi';
import { formatUnits } from 'ethers6';

type IGas = {
    size?: number;
    className?: string;
};

export const Gas = ({ size, className }: IGas) => {
    const { data, isError } = useFeeData();

    if (isError) return <></>;
    return (
        <div className={`flex items-center gap-0.5 ${className || ''}`}>
            <MdLocalGasStation size={size || ''} />
            <span className="">
                {Math.round(Number(formatUnits(data?.formatted?.gasPrice || '', 9)))}
            </span>
        </div>
    );
};
