import { useState, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const DURATION = 3800; // ms

const PHASES = {
    fadeIn: { start: 0, end: 0.15 },
    particleSpawn: { start: 0.1, end: 0.5 },
    coreAwaken: { start: 0.3, end: 0.6 },
    eyeOpen: { start: 0.65, end: 0.85 },
    cameraMove: { start: 0.2, end: 0.95 },
    orbitMaterialize: { start: 0.35, end: 0.7 }
};

const CAMERA_START = { x: 35, y: 15, z: 35 };
const CAMERA_END = { x: 19.93, y: 2.52, z: -10.79 };

export const useIntroAnimation = (onComplete) => {
    const [isFinished, setIsFinished] = useState(false);
    const activeRef = useRef(true);
    const progressRef = useRef(0);
    const { camera, gl } = useThree();

    const getPhaseProgress = (phase, globalProgress) => {
        if (globalProgress < phase.start) return 0;
        if (globalProgress > phase.end) return 1;
        return (globalProgress - phase.start) / (phase.end - phase.start);
    };

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
    const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    // Strict exposure reset on mount
    useEffect(() => {
        gl.toneMappingExposure = 0;
    }, [gl]);

    useFrame((state) => {
        if (!activeRef.current) return;

        const elapsed = state.clock.elapsedTime * 1000;
        const currentProgress = Math.min(elapsed / DURATION, 1.0);
        progressRef.current = currentProgress;

        // 1. Fade In - Clamp to 0.0001 minimum to prevent ACES black-out glitches
        const fadeP = getPhaseProgress(PHASES.fadeIn, currentProgress);
        gl.toneMappingExposure = Math.max(0.0001, easeOutCubic(fadeP));

        // 2. Camera Move
        const camP = getPhaseProgress(PHASES.cameraMove, currentProgress);
        const camEased = easeInOutCubic(camP);
        camera.position.x = CAMERA_START.x + (CAMERA_END.x - CAMERA_START.x) * camEased;
        camera.position.y = CAMERA_START.y + (CAMERA_END.y - CAMERA_START.y) * camEased;
        camera.position.z = CAMERA_START.z + (CAMERA_END.z - CAMERA_START.z) * camEased;
        camera.lookAt(0, 0, 0);

        if (currentProgress >= 1.0) {
            activeRef.current = false;
            gl.toneMappingExposure = 1.0;
            
            // Consolidate final state
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
