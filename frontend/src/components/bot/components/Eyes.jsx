// frontend/src/components/bot/components/Eyes.jsx
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG } from '../config/sceneConfig';
import { useAttentionTracking } from '../hooks/useAttentionTracking';

export const Eyes = ({ hideAnimation, intro, theme }) => {
    const leftEyeRef  = useRef();
    const rightEyeRef = useRef();
    const { eyeCloseFactor, eyeOpacity, isActive: isHideActive } = hideAnimation;
    const { active: introActive, progressRef: introProgressRef } = intro;

    // ✅ Build geometry with THREE.Shape API
    const eyeGeometry = useMemo(() => {
        const shape = new THREE.Shape();
        const r = CONFIG.eyeWidth;
        const l = CONFIG.eyeHeight;
        shape.absarc(0,  l / 2, r, Math.PI, 0,       true);
        shape.absarc(0, -l / 2, r, 0,       Math.PI, true);
        return new THREE.ShapeGeometry(shape, 32);
    }, []);

    const isDark = theme.isDarkMode;
    const material = useMemo(() => new THREE.MeshStandardMaterial({
        color:             isDark ? 0xffffff : 0x000000,
        emissive:          isDark ? 0xffffff : 0x000000,
        emissiveIntensity: isDark ? 1.2 : 0,
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: true,
    }), [isDark]);

    const eyeZ   = CONFIG.coreRadius + 0.05;    // ✅ sits just in front of sphere surface
    const eyeSep = CONFIG.eyeSeparation / 2;
    const lookAtRef = useAttentionTracking();

    useFrame(() => {
        if (!leftEyeRef.current || !rightEyeRef.current) return;
        let scaleY = 1;
        if (isHideActive || hideAnimation.isFullyHidden) {
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
