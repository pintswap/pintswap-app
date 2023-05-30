type ITextDisplayProps = {
    label?: string;
    value: string | number;
    size?: `text-${string}`;
};

export const TextDisplay = ({ label, value, size }: ITextDisplayProps) => {
    return (
        <div className="flex flex-col">
            <span className="text-xs">{label}</span>
            <span className={`${size || 'text-lg'}`}>{value}</span>
        </div>
    );
};
