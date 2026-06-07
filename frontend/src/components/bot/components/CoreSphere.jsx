import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Float, useCursor } from '@react-three/drei';
import * as THREE from 'three';
import { CONFIG } from '../config/sceneConfig';
import { Eyes } from './Eyes';

export const CoreSphere = ({ theme, visible, intro, hideAnimation, onIgnitionChange, ignition, mode, setMode }) => {
    const { camera, scene } = useThree();
    const coreRef = useRef();
    const glassRef = useRef();
    const sunRef = useRef();
    const pointLightRef = useRef();

    // Materials
    const materials = useMemo(() => {
        // Safety guard for theme
        if (!theme?.currentTheme?.coreColor) return null;

        const glassMaterial = new THREE.MeshPhysicalMaterial({
            color: theme.currentTheme.coreColor,
            metalness: 0.1,
            roughness: 0.1,
            transmission: 0.9,
            thickness: 0.5,
            transparent: true,
            opacity: 0.95,
        });

        const sunMaterial = new THREE.MeshStandardMaterial({
            color: theme.currentTheme.coreColor,
            emissive: theme.currentTheme.coreColor,
            emissiveIntensity: CONFIG.sunEmissiveTarget,
            roughness: 0.2,
            metalness: 0.5,
        });

        return { glassMaterial, sunMaterial };
    }, [theme?.currentTheme?.coreColor]);

    if (!materials) return null;

    // Transition state
    const [transitionState, setTransitionState] = React.useState('glass'); // 'glass' or 'sun'
    const [currentEmissive, setCurrentEmissive] = React.useState(0);

    React.useEffect(() => {
        if (mode === 'sun' && transitionState !== 'sun') {
            setTransitionState('sun');
        } else if (mode === 'glass' && transitionState !== 'glass') {
            setTransitionState('glass');
        }
    }, [mode, transitionState]);

    useFrame((state) => {
        if (!coreRef.current) return;

        const time = state.clock.elapsedTime;
        const hideState = hideAnimation.getState();

        // Hide animation
        coreRef.current.scale.setScalar(hideState.coreScale);
        coreRef.current.material.opacity = hideState.coreOpacity;
        coreRef.current.material.emissiveIntensity = hideState.coreOpacity * (transitionState === 'sun' ? CONFIG.sunEmissiveTarget : CONFIG.coreLightGlass);
        
        if (coreRef.current.material.blur !== undefined) {
            coreRef.current.material.blur = hideState.coreBlur;
        }

        // Intro animation
        if (intro.active) {
            const progress = intro.progressRef.current;
            const scale = progress < 0.2 ? 0 : Math.min(Math.pow(progress / 0.2, 2), 1);
            coreRef.current.scale.setScalar(hideState.coreScale * scale);
            
            // Pulsing effect during intro
            const pulse = 1 + 0.1 * Math.sin(time * 2);
            coreRef.current.scale.multiplyScalar(pulse);
            coreRef.current.scale.divideScalar(pulse); // Reset after pulsing
        }

        // Point light intensity
        if (pointLightRef.current) {
            pointLightRef.current.intensity = transitionState === 'sun' 
                ? CONFIG.coreLightSun * hideState.coreOpacity 
                : CONFIG.coreLightGlass * hideState.coreOpacity;
        }

        // Glass brightness boost
        if (glassRef.current && transitionState === 'glass') {
            glassRef.current.emissiveIntensity = hideState.coreOpacity * CONFIG.glassBrightnessBoost;
        }
    });

    const [hovered, setHover] = React.useState(false);
    useCursor(hovered);
    const isFullyHidden = hideAnimation.getState().isFullyHidden;

    if (isFullyHidden) return null;

    return (
        <group ref={coreRef} position={[0, 0, 0]} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
            {/* Sun Material Sphere */}
            <mesh
                ref={sunRef}
                visible={transitionState === 'sun'}
                scale={[CONFIG.coreRadius, CONFIG.coreRadius, CONFIG.coreRadius]}
            >
                <sphereGeometry args={[1, 64, 64]} />
                <meshStandardMaterial attach="material" {...materials.sunMaterial} />
            </mesh>

            {/* Glass Material Sphere */}
            <mesh
                ref={glassRef}
                visible={transitionState === 'glass'}
                scale={[CONFIG.coreRadius, CONFIG.coreRadius, CONFIG.coreRadius]}
            >
                <sphereGeometry args={[1, 64, 64]} />
                <meshPhysicalMaterial attach="material" {...materials.glassMaterial} />
            </mesh>

            {/* Core Eyes */}
            <Eyes
                hideAnimation={hideAnimation}
                intro={intro}
                theme={theme}
            />

            {/* Point Light */}
            <pointLight
                ref={pointLightRef}
                position={[0, 0, 0]}
                intensity={CONFIG.coreLightGlass}
                color={theme.currentTheme.coreColor}
                distance={20}
            />
        </group>
    );
};
