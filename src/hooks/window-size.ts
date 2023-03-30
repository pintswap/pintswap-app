import { useLayoutEffect, useState } from 'react';

type WindowDimensions = {
    width: number;
    height: number;
};

type WindowDimensionsReturn = {
    width: number;
    height: number;
    breakpoint: number;
};

const useWindowSize = (): WindowDimensionsReturn => {
    const breakpoint = 768;
    const [windowDimensions, setWindowDimensions] = useState<WindowDimensions>({
        width: 0,
        height: 0,
    });
    useLayoutEffect(() => {
        function handleResize(): void {
            setWindowDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }
        handleResize();
        window.addEventListener('resize', handleResize);
        return (): void => window.removeEventListener('resize', handleResize);
    }, []);

    return {
        ...windowDimensions,
        breakpoint,
    };
};

export { useWindowSize };
