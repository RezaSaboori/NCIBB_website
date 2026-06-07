import { useState, useEffect } from 'react';

export const useCssBackground = () => {
    const [css, setCss] = useState(() => {
        // Read synchronously on first render to avoid the undefined frame
        return getComputedStyle(document.body).backgroundColor || '#0a0a1a';
    });

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setCss(getComputedStyle(document.body).backgroundColor);
        });
        observer.observe(document.body, { attributes: true, attributeFilter: ['style', 'class'] });

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => setCss(getComputedStyle(document.body).backgroundColor);
        mediaQuery.addEventListener('change', handleChange);

        return () => {
            observer.disconnect();
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, []);

    return { css };
};
