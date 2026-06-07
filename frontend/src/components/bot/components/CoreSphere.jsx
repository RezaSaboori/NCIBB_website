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
            color:             0xffffff,
            metalness:         0.0,
            roughness:         0.0,
            transmission:      0.99,
            thickness:         3.5,
            ior:               1.5,
            envMapIntensity:   0.05,
            specularIntensity: 0.0,
            clearcoat:         0.0,
            side:              THREE.FrontSide,
            transparent:       true,
        });
        glassMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uGlassBrightnessBoost = { value: CONFIG.glassBrightnessBoost };
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <output_fragment>',
                `#ifdef USE_TRANSMISSION
gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * (1.0 + uGlassBrightnessBoost), transmission);
#endif
#include <output_fragment>`
            );
        };

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
            glassRef.current.material.emissiveIntensity = hideState.coreOpacity * CONFIG.glassBrightnessBoost;
        }
    
        // Camera-facing rotation for the core group
        if (coreRef.current && camera) {
            const angle = Math.atan2(
                camera.position.x - coreRef.current.position.x,
                camera.position.z - coreRef.current.position.z
            );
            coreRef.current.rotation.y = angle;
        }
    });

    const sphereGeo = useMemo(() => new THREE.SphereGeometry(CONFIG.coreRadius, 64, 64), []);

    return (
        <group ref={coreRef} position={[0, 0, 0]} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
            {/* Sun Material Sphere */}
            <mesh
                ref={sunRef}
                visible={transitionState === 'sun'}
            >
                <primitive object={sphereGeo} attach="geometry" />
                <primitive object={materials.sunMaterial} attach="material" />
            </mesh>

            {/* Glass Material Sphere */}
            <mesh
                ref={glassRef}
                visible={transitionState === 'glass'}
            >
                <primitive object={sphereGeo} attach="geometry" />
                <primitive object={materials.glassMaterial} attach="material" />
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
