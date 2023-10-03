type IHamburgerProps = {
    state: boolean;
    className?: string;
};

export const AnimatedHamburger = ({ state, className }: IHamburgerProps) => {
    const genericHamburgerLine = `h-[2px] w-6 my-[3px] bg-white transition ease transform duration-200 rounded-[1px]`;
    return (
        <div
            className={`p-1 group flex flex-col justify-center items-center h- ${className || ''}`}
        >
            <div
                className={`${genericHamburgerLine} ${state ? 'rotate-45 translate-y-[8px]' : ''}`}
            />
            <div className={`${genericHamburgerLine} ${state ? 'opacity-0' : ''}`} />
            <div
                className={`${genericHamburgerLine} ${
                    state ? '-rotate-45 -translate-y-[8px]' : ''
                }`}
            />
        </div>
    );
};
