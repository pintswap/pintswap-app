type IStatusIndicatorProps = {
    active: boolean;
    className?: string;
    size?: `sm` | 'md' | 'lg';
    message?: string;
    customColors?: string[];
};

export const StatusIndicator = ({
    active,
    className,
    size,
    message,
    customColors,
}: IStatusIndicatorProps) => {
    const renderSize = () => {
        switch (size) {
            case 'sm':
                return 'h-1 w-1';
            case 'lg':
                return 'h-4 w-4';
            default:
                return 'h-2.5 w-2.5';
        }
    };
    const renderColor = () => {
        if (customColors) {
            if (active) return customColors[1] || 'bg-green-400';
            return customColors[0] || 'bg-red-400';
        }
        if (active) return 'bg-green-400';
        else return 'bg-red-400';
    };

    return (
        <div
            className={`${className || ''} ${
                message ? 'flex items-center gap-1.5' : 'absolute z-50'
            }`}
        >
            <span className={`${renderSize()} ${renderColor()} rounded-full block`} />
            {message && <span className="text-xs">{message}</span>}
        </div>
    );
};
