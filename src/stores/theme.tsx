import React, { Dispatch, SetStateAction } from 'react';

type IThemeProps = {
    theme: string;
    setTheme: Dispatch<SetStateAction<string>>;
    isDark: boolean;
};

const getInitialTheme = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
        const storedPrefs = window.localStorage.getItem('color-theme');
        if (typeof storedPrefs === 'string') {
            return storedPrefs;
        }

        const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
        if (userMedia.matches) {
            return 'dark';
        }
    }

    return 'light'; // light theme as the default;
};

export const ThemeContext = React.createContext<IThemeProps>({
    theme: '',
    setTheme: () => {},
    isDark: false,
});

export const ThemeStore = ({ initialTheme, children }: any) => {
    const [theme, setTheme] = React.useState(getInitialTheme);
    const isDark = theme === 'dark' ? true : false;

    const rawSetTheme = (rawTheme: any) => {
        const root = window.document.documentElement;
        const isDark = rawTheme === 'dark';

        root.classList.remove(isDark ? 'light' : 'dark');
        root.classList.add(rawTheme);

        localStorage.setItem('color-theme', rawTheme);
    };

    if (initialTheme) {
        rawSetTheme(initialTheme);
    }

    React.useEffect(() => {
        rawSetTheme(theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const themeContext = React.createContext<any>(ThemeContext);
