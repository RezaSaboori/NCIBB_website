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

    // ALL hooks at the top - no early returns before this block
    const [transitionState, setTransitionState] = React.useState('glass'); // 'glass' or 'sun'
    const [currentEmissive, setCurrentEmissive] = React.useState(0);
    const [hovered, setHover] = React.useState(false);
    useCursor(hovered);

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

    React.useEffect(() => {
        if (mode === 'sun' && transitionState !== 'sun') {
            setTransitionState('sun');
        } else if (mode === 'glass' && transitionState !== 'glass') {
            setTransitionState('glass');
        }
    }, [mode, transitionState]);

    useFrame((state) => {
        if (!materials || !hideAnimation) return;
    
        const time = state.clock.elapsedTime;
        const hideState = hideAnimation;
    
        // Target the correct mesh based on transition state
        const activeMeshRef = transitionState === 'glass' ? glassRef : sunRef;
        if (!activeMeshRef.current) return;
    
        // Hide animation
        activeMeshRef.current.scale.setScalar(hideState.coreScale);
        activeMeshRef.current.material.opacity = hideState.coreOpacity;
        activeMeshRef.current.material.emissiveIntensity = hideState.coreOpacity * (transitionState === 'sun' ? CONFIG.sunEmissiveTarget : CONFIG.coreLightGlass);
        
        if (activeMeshRef.current.material.blur !== undefined) {
            activeMeshRef.current.material.blur = hideState.coreBlur;
        }
    
        // Intro animation
        if (intro.active) {
            const progress = intro.progressRef.current;
            const scale = progress < 0.2 ? 0 : Math.min(Math.pow(progress / 0.2, 2), 1);
            activeMeshRef.current.scale.setScalar(hideState.coreScale * scale);
            
            // Pulsing effect during intro
            const pulse = 1 + 0.1 * Math.sin(time * 2);
            activeMeshRef.current.scale.multiplyScalar(pulse);
            activeMeshRef.current.scale.divideScalar(pulse); // Reset after pulsing
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

    // Guard at JSX level only (after all hooks have run)
    if (!materials || !hideAnimation) return null;
    const isFullyHidden = hideAnimation.isFullyHidden;
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
