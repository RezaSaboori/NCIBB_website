import { useState, useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';

const BLINK_STATES = { IDLE: 0, CLOSING: 1, OPENING: 2 };

export const useBlinkFSM = () => {
    const [eyeScaleY, setEyeScaleY] = useState(1.0);
    const blinkState = useRef({
        state: BLINK_STATES.IDLE,
        nextBlinkTime: 0,
        phaseStartTime: 0,
        closeDuration: 0.15,
        openDuration: 0.15
    });

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    useFrame((state) => {
        const now = state.clock.elapsedTime;

        if (blinkState.current.state === BLINK_STATES.IDLE) {
            if (now >= blinkState.current.nextBlinkTime) {
                blinkState.current.state = BLINK_STATES.CLOSING;
                blinkState.current.phaseStartTime = now;
            }
        } else if (blinkState.current.state === BLINK_STATES.CLOSING) {
            const elapsed = now - blinkState.current.phaseStartTime;
            let progress = elapsed / blinkState.current.closeDuration;
            if (progress >= 1.0) {
                blinkState.current.state = BLINK_STATES.OPENING;
                blinkState.current.phaseStartTime = now;
                setEyeScaleY(0.0);
            } else {
                setEyeScaleY(1.0 - easeOutCubic(progress));
            }
        } else if (blinkState.current.state === BLINK_STATES.OPENING) {
            const elapsed = now - blinkState.current.phaseStartTime;
            let progress = elapsed / blinkState.current.openDuration;
            if (progress >= 1.0) {
                blinkState.current.state = BLINK_STATES.IDLE;
                blinkState.current.nextBlinkTime = now + 2.0 + Math.random() * 4.0;
                setEyeScaleY(1.0);
            } else {
                setEyeScaleY(easeOutCubic(progress));
            }
        }
    });

    return eyeScaleY;
};

