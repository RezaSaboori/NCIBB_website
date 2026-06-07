import { useState, useEffect } from 'react';

export const useCssBackground = () => {
    const [css, setCss] = useState(() => {
        // Read synchronously on first render to avoid the undefined frame
        const bodyColor = getComputedStyle(document.body).backgroundColor;
        const htmlColor = getComputedStyle(document.documentElement).backgroundColor;
        // rgba(0,0,0,0) means transparent — fall through
        if (bodyColor && bodyColor !== 'rgba(0, 0, 0, 0)') return bodyColor;
        if (htmlColor && htmlColor !== 'rgba(0, 0, 0, 0)') return htmlColor;
        return '#050505'; // match THEMES.dark.background
    });

    useEffect(() => {
        const observer = new MutationObserver(() => {
            const bodyColor = getComputedStyle(document.body).backgroundColor;
            const htmlColor = getComputedStyle(document.documentElement).backgroundColor;
            if (bodyColor && bodyColor !== 'rgba(0, 0, 0, 0)') {
                setCss(bodyColor);
            } else if (htmlColor && htmlColor !== 'rgba(0, 0, 0, 0)') {
                setCss(htmlColor);
            }
        });
        observer.observe(document.body, { attributes: true, attributeFilter: ['style', 'class'] });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'class'] });

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            const bodyColor = getComputedStyle(document.body).backgroundColor;
            const htmlColor = getComputedStyle(document.documentElement).backgroundColor;
            if (bodyColor && bodyColor !== 'rgba(0, 0, 0, 0)') {
                setCss(bodyColor);
            } else if (htmlColor && htmlColor !== 'rgba(0, 0, 0, 0)') {
                setCss(htmlColor);
            }
        };
        mediaQuery.addEventListener('change', handleChange);

        return () => {
            observer.disconnect();
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, []);

    return { css };
};
