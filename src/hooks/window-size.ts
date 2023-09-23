import { useLayoutEffect, useState } from 'react';

type WindowDimensions = {
    width: number;
    height: number;
};

const breakpoints = {
    sm: 600,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
    '3xl': 1920,
};

const useWindowSize = () => {
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
        breakpoints,
        tableBreak: windowDimensions.width >= 900,
    };
};

export { useWindowSize };
