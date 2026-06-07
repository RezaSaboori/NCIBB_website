import { useState, useEffect } from 'react';

/**
 * Reads --color-gray2 from :root / .dark and returns it as both
 * a CSS string (for the wrapper div) and a hex number (for Three.js fog/color).
 * Automatically updates when the .dark class is toggled on <html>.
 */
export const useCssBackground = () => {
    const read = () =>
        getComputedStyle(document.documentElement)
            .getPropertyValue('--color-gray2')
            .trim();

    const cssToHex = (cssColor) => {
        // cssColor is "rgb(r, g, b)" — parse and convert to 0xRRGGBB number
        const m = cssColor.match(/\d+/g);
        if (!m || m.length < 3) return 0x050505;
        return (parseInt(m[0]) << 16) | (parseInt(m[1]) << 8) | parseInt(m[2]);
    };

    const [bg, setBg] = useState(() => {
        const css = read();
        return { css, hex: cssToHex(css) };
    });

    useEffect(() => {
        // MutationObserver watches for .dark class being added/removed on <html>
        const observer = new MutationObserver(() => {
            // rAF: wait one paint so CSS variables are resolved after class toggle
            requestAnimationFrame(() => {
                const css = read();
                setBg({ css, hex: cssToHex(css) });
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    return bg; // { css: "rgb(27,27,27)", hex: 0x1b1b1b }
};
