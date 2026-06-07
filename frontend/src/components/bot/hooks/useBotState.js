import { useState, useCallback } from 'react';
import { ANIMATION_STATES, ANIMATION_SPEEDS } from '../config/sceneConfig';

export const useBotState = () => {
    const [animationState, setAnimationState] = useState(ANIMATION_STATES.IDLE);
    const [speed, setSpeed] = useState(ANIMATION_SPEEDS.NORMAL);
    const [isHovered, setIsHovered] = useState(false);

    const setBotState = useCallback((state) => {
        setAnimationState(state);
    }, []);

    const toggleHover = useCallback((hovered) => {
        setIsHovered(hovered);
    }, []);

    const changeSpeed = useCallback((newSpeed) => {
        setSpeed(newSpeed);
    }, []);

    return {
        animationState,
        setBotState,
        speed,
        changeSpeed,
        isHovered,
        toggleHover
    };
};
