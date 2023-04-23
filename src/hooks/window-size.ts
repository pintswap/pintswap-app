import { useLayoutEffect, useState } from 'react';

type WindowDimensions = {
    width: number;
    height: number;
};

type WindowDimensionsReturn = {
    width: number;
    height: number;
    breakpoints: {
        sm: number;
        md: number;
        lg: number;
        xl: number;
    };
};


const breakpoints = {
    sm: 600,
    md: 768,
    lg: 1024,
    xl: 1280
}

const useWindowSize = (): WindowDimensionsReturn => {
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
        breakpoints
    };
};

export { useWindowSize };
