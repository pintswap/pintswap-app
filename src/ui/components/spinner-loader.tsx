type ISpinnerLoaderProps = {
    size?: `${string}px`;
    height?: `min-h-${string}`;
    className?: string;
};

export const SpinnerLoader = ({
    size = '20px',
    height = 'min-h-[50px]',
    className,
}: ISpinnerLoaderProps) => (
    <div className={`flex ${className ? className : ''} justify-center items-center ${height}`}>
        <div
            className="Toastify__spinner"
            style={{ height: size || 'auto', width: size || 'auto' }}
        />
    </div>
);
