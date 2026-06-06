import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG } from '../config/sceneConfig';
import { useBlinkFSM } from '../hooks/useBlinkFSM';
import { useAttentionTracking } from '../hooks/useAttentionTracking';

export const Eyes = ({ isGlass, theme, intro, hideAnimation }) => {
    const leftEyeRef = useRef();
    const rightEyeRef = useRef();
    const { active: introActive, progressRef: introProgressRef } = intro;
    
    const eyeScaleY = useBlinkFSM();
    const lookAtRef = useAttentionTracking();

    const { eyeCloseFactor, eyeOpacity, isActive: isHideActive } = hideAnimation || { eyeCloseFactor: 1, eyeOpacity: 1, isActive: false };

    const eyeGeometry = useMemo(() => {
        const shape = new THREE.Shape();
        const r = CONFIG.eyeWidth;
        const l = CONFIG.eyeHeight;
        shape.absarc(0, l / 2, r, Math.PI, 0, true);
        shape.absarc(0, -l / 2, r, 0, Math.PI, true);
        return new THREE.ShapeGeometry(shape, 32);
    }, []);

    const eyeBlackMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide, transparent: true, depthWrite: true }), []);
    const eyeWhiteMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1.0, metalness: 0.0, envMapIntensity: 0.0, emissive: 0xffffff, emissiveIntensity: 1.2, side: THREE.DoubleSide, transparent: true, depthWrite: true }), []);

    const material = useMemo(() => {
        if (!isGlass) return eyeBlackMaterial;
        return theme.isDarkMode ? eyeWhiteMaterial : eyeBlackMaterial;
    }, [isGlass, theme.isDarkMode, eyeBlackMaterial, eyeWhiteMaterial]);

    const eyeZ = CONFIG.coreRadius + 0.05;
    const eyeSep = CONFIG.eyeSeparation / 2;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    useFrame(() => {
        if (!leftEyeRef.current || !rightEyeRef.current) return;

        let currentEyeScaleY = eyeScaleY;
        
        if (isHideActive || (hideAnimation && hideAnimation.isFullyHidden)) {
            currentEyeScaleY = eyeCloseFactor;
        } else if (introActive) {
            const eyeStart = 0.65;
            const eyeEnd = 0.85;
            let eyeP = 0;
            const progress = introProgressRef.current;
            if (progress >= eyeStart) {
                eyeP = Math.min((progress - eyeStart) / (eyeEnd - eyeStart), 1.0);
            }
            currentEyeScaleY = easeOutCubic(eyeP);
        }

        // Apply eye opacity
        material.opacity = eyeOpacity;

        const { x, y } = lookAtRef.current;
        
        leftEyeRef.current.position.x = -eyeSep + (introActive ? 0 : x);
        leftEyeRef.current.position.y = CONFIG.eyeBaseY + (introActive ? 0 : y);
        leftEyeRef.current.scale.y = currentEyeScaleY;

        rightEyeRef.current.position.x = eyeSep + (introActive ? 0 : x);
        rightEyeRef.current.position.y = CONFIG.eyeBaseY + (introActive ? 0 : y);
        rightEyeRef.current.scale.y = currentEyeScaleY;
    });

    return (
        <group>
            <mesh ref={leftEyeRef} geometry={eyeGeometry} material={material} position={[-eyeSep, CONFIG.eyeBaseY, eyeZ]} renderOrder={10} />
            <mesh ref={rightEyeRef} geometry={eyeGeometry} material={material} position={[eyeSep, CONFIG.eyeBaseY, eyeZ]} renderOrder={10} />
        </group>
    );
};
