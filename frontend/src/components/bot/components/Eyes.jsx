// frontend/src/components/bot/components/Eyes.jsx
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG } from '../config/sceneConfig';
import { useAttentionTracking } from '../hooks/useAttentionTracking';

export const Eyes = ({ isGlass, hideAnimation, intro, theme }) => {
    const leftEyeRef  = useRef();
    const rightEyeRef = useRef();
    const { active: introActive, progressRef: introProgressRef } = intro;

    // hideAnimation is now a ref returned from useCoreHideAnimation
    const hideAnimRef = hideAnimation;

    // Build geometry with THREE.Shape API
    const eyeGeometry = useMemo(() => {
        const shape = new THREE.Shape();
        const r = CONFIG.eyeWidth;
        const l = CONFIG.eyeHeight;
        shape.absarc(0,  l / 2, r, Math.PI, 0,       true);
        shape.absarc(0, -l / 2, r, 0,       Math.PI, true);
        return new THREE.ShapeGeometry(shape, 32);
    }, []);

    // Eye materials - use two stable materials for proper updates
    const eyeBlackMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: 0x000000,
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: true,
    }), []);

    const eyeWhiteMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 1.2,
        roughness: 1.0,
        metalness: 0.0,
        envMapIntensity: 0.0,
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: true,
    }), []);

    // Eyes are white only when glass AND dark mode (white eyes visible through glass)
    // Sun mode always uses black eyes
    const material = useMemo(() => {
        if (!isGlass) return eyeBlackMaterial;                  // sun → always black
        return theme.isDarkMode ? eyeWhiteMaterial : eyeBlackMaterial; // glass → depends on theme
    }, [isGlass, theme.isDarkMode, eyeBlackMaterial, eyeWhiteMaterial]);

    const eyeZ   = CONFIG.coreRadius + 0.05;    // sits just in front of sphere surface
    const eyeSep = CONFIG.eyeSeparation / 2;
    const lookAtRef = useAttentionTracking();

    useFrame(() => {
        if (!leftEyeRef.current || !rightEyeRef.current) return;

        // Read live values from hideAnimation ref every frame
        const hide = hideAnimRef?.current ?? { eyeCloseFactor: 1, eyeOpacity: 1, isActive: false, isFullyHidden: false };
        const { eyeCloseFactor, eyeOpacity, isActive: isHideActive } = hide;

        let scaleY = 1;
        if (isHideActive || hide.isFullyHidden) {
            scaleY = eyeCloseFactor;
        } else if (introActive) {
            const p = introProgressRef.current;
            const start = 0.65, end = 0.85;
            scaleY = p >= start ? Math.min((p - start) / (end - start), 1) : 0;
        }
        
        material.opacity = eyeOpacity;
        
        // Cursor tracking
        const { x, y } = lookAtRef.current;
        leftEyeRef.current.position.x  = -eyeSep + (introActive ? 0 : x);
        leftEyeRef.current.position.y  = CONFIG.eyeBaseY + (introActive ? 0 : y);
        rightEyeRef.current.position.x =  eyeSep + (introActive ? 0 : x);
        rightEyeRef.current.position.y = CONFIG.eyeBaseY + (introActive ? 0 : y);
        
        leftEyeRef.current.scale.y  = scaleY;
        rightEyeRef.current.scale.y = scaleY;
    });

    return (
        <group>
            <mesh ref={leftEyeRef}  geometry={eyeGeometry} material={material}
                  position={[-eyeSep, CONFIG.eyeBaseY, eyeZ]} renderOrder={10} />
            <mesh ref={rightEyeRef} geometry={eyeGeometry} material={material}
                  position={[ eyeSep, CONFIG.eyeBaseY, eyeZ]} renderOrder={10} />
        </group>
    );
};
