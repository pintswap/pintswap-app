import { BiTrendingUp, BiTrendingDown } from 'react-icons/bi';

type IStatistic = {
    label: string;
    value: string | number;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    align?: 'center' | 'left' | 'right';
    className?: string;
    change?: number | string;
    hover?: boolean;
};

export const Statistic = ({ label, value, size, align, className, change, hover }: IStatistic) => {
    const sizeClass = () => {
        switch (size) {
            case 'xl':
                return { label: 'text-sm', value: 'text-3xl', gap: 'gap-1.5' };
            case 'lg':
                return { label: 'text-sm', value: 'text-2xl', gap: 'gap-1.5' };
            case 'sm':
                return { label: 'text-xs', value: 'text-lg', gap: 'gap-0.5' };
            default:
                return { label: 'text-xs', value: 'text-xl', gap: 'gap-1' };
        }
    };

    const alignClass = () => {
        switch (align) {
            case 'center':
                return 'text-center items-center';
            case 'right':
                return 'text-right items-end';
            default:
                return 'text-left items-start';
        }
    };

    const renderChange = () => {
        if (Number(change) < 0) return { color: 'text-red-400', icon: <BiTrendingDown /> };
        else if (Number(change) > 0) return { color: 'text-green-400', icon: <BiTrendingUp /> };
        else return { color: '', icon: <></> };
    };

    return (
        <div
            className={`transition duration-100 rounded-lg py-3 px-4 border-2 bg-neutral-900 border-neutral-700 flex flex-col ${
                sizeClass().gap
            } ${alignClass()} ${className || ''} ${hover ? 'hover:border-indigo-600' : ''}`}
        >
            <div className="flex justify-between items-center w-full">
                <span className={`${sizeClass().label} text-gray-400`}>{label}</span>
                {change && (
                    <span className={`flex gap-1.5 ${renderChange().color} text-xs`}>
                        {`${Math.abs(Number(change))}%`}
                        {renderChange().icon}
                    </span>
                )}
            </div>
            <span className={`${sizeClass().value}`}>{value}</span>
        </div>
    );
};
