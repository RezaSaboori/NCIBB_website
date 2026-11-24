import { useState, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { INTRO_CAMERA } from '../config/sceneConfig';

const PHASES = {
    particleSpawn: { start: 0.1, end: 0.5 },
    coreAwaken: { start: 0.3, end: 0.6 },
    eyeOpen: { start: 0.65, end: 0.85 },
    cameraMove: { start: 0.2, end: 0.95 },
    orbitMaterialize: { start: 0.35, end: 0.7 }
};

const [startX, startY, startZ] = INTRO_CAMERA.position;
const CAMERA_END = { x: 19.93, y: 2.52, z: -10.79 };

export const useIntroAnimation = (duration = 3800, onComplete) => {
    const [isFinished, setIsFinished] = useState(false);
    const activeRef = useRef(true);
    const progressRef = useRef(0);
    const camera = useThree((state) => state.camera);

    const getPhaseProgress = (phase, globalProgress) => {
        if (globalProgress < phase.start) return 0;
        if (globalProgress > phase.end) return 1;
        return (globalProgress - phase.start) / (phase.end - phase.start);
    };

    const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    useFrame((state) => {
        if (!activeRef.current) return;

        const elapsed = state.clock.elapsedTime * 1000;
        const currentProgress = Math.min(elapsed / duration, 1.0);
        progressRef.current = currentProgress;

        const camP = getPhaseProgress(PHASES.cameraMove, currentProgress);
        const camEased = easeInOutCubic(camP);
        camera.position.set(
            startX + (CAMERA_END.x - startX) * camEased,
            startY + (CAMERA_END.y - startY) * camEased,
            startZ + (CAMERA_END.z - startZ) * camEased,
        );
        camera.lookAt(0, 0, 0);

        if (currentProgress >= 1.0) {
            activeRef.current = false;
            setIsFinished(true);
            if (onComplete) onComplete();
        }
    });

    return { 
        active: activeRef.current, 
        isFinished, 
        progressRef, 
        getPhaseProgress 
    };
};
