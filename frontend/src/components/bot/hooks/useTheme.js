import { useState, useCallback } from 'react';
import { THEMES } from '../config/themeConfig';

export const useTheme = () => {
    const [themeKey, setThemeKey] = useState('dark');
    const currentTheme = THEMES[themeKey];

    const toggleTheme = useCallback(() => {
        setThemeKey(prev => prev === 'dark' ? 'light' : 'dark');
    }, []);

    return {
        themeKey,
        currentTheme,
        toggleTheme,
        isDarkMode: themeKey === 'dark'
    };
};
