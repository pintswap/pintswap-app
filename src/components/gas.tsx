import { MdLocalGasStation } from 'react-icons/md';
import { useFeeData } from 'wagmi';
import { formatUnits } from 'ethers6';

type IGas = {
    size?: number;
    className?: string;
    units?: 'gwei';
};

export const Gas = ({ size, className, units }: IGas) => {
    const { data, isError } = useFeeData();

    if (isError) return <></>;
    return (
        <div className="flex flex-col mt-1 cursor-default">
            <div className={`flex items-center gap-0.5 leading-3 ${className || ''}`}>
                <MdLocalGasStation size={size || ''} />
                <span className="">
                    {Math.round(Number(formatUnits(data?.formatted?.gasPrice || '', 9)))}
                </span>
            </div>
            {units && <span className="text-[10px] text-neutral-400 leading-3">{units}</span>}
        </div>
    );
};
