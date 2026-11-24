import { useSyncExternalStore } from 'react';

const TARGET_RENDER_PIXELS = 1_700_000;

const subscribe = (onResize) => {
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
};

const readPixelRatio = () => {
    const viewportPixels = window.innerWidth * window.innerHeight;
    const budgetRatio = Math.sqrt(TARGET_RENDER_PIXELS / viewportPixels);
    // The glass and bloom passes also use this resolution. Small screens can keep their higher density.
    return Math.max(0.75, Math.min(window.devicePixelRatio, 1.5, budgetRatio));
};

export const useBotPixelRatio = () => useSyncExternalStore(subscribe, readPixelRatio, () => 1);
