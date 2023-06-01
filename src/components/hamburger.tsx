type IHamburgerProps = {
    state: boolean;
};

export const AnimatedHamburger = ({ state }: IHamburgerProps) => {
    const genericHamburgerLine = `h-1 w-6 my-[3px] rounded-full bg-white transition ease transform duration-200 rounded`;
    return (
        <div className={`p-1 group flex flex-col justify-center items-center`}>
            <div
                className={`${genericHamburgerLine} ${
                    state ? 'rotate-45 translate-y-[10.3px]' : ''
                }`}
            />
            <div className={`${genericHamburgerLine} ${state ? 'opacity-0' : ''}`} />
            <div
                className={`${genericHamburgerLine} ${
                    state ? '-rotate-45 -translate-y-[10.3px]' : ''
                }`}
            />
        </div>
    );
};
