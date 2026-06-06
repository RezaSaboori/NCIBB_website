import React, { useMemo, useRef, useEffect, memo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG } from '../config/sceneConfig';
import { Eyes } from './Eyes';

export const CoreSphere = memo(({ isGlass, theme, intro, hideAnimation }) => {
    const meshRef = useRef();
    const lightRef = useRef();
    const { camera } = useThree();
    const { active: introActive, progressRef: introProgressRef } = intro;

    const { coreScale, coreOpacity, coreBlur, isActive: isHideActive } = hideAnimation || { coreScale: 1, coreOpacity: 1, coreBlur: 0, isActive: false };

    const sunMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: 0x000000,
        emissive: CONFIG.coreColor,
        emissiveIntensity: CONFIG.sunEmissiveTarget,
        roughness: 0.4,
        metalness: 0.8,
        transparent: true
    }), []);

    const glassMaterial = useMemo(() => {
        const mat = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0.0,
            roughness: 0.0,
            transmission: 0.99,
            thickness: 3.5,
            ior: 1.5,
            envMapIntensity: 0.05,
            specularIntensity: 0.0,
            clearcoat: 0.0,
            side: THREE.FrontSide,
            transparent: true
        });
        mat.onBeforeCompile = (shader) => {
            shader.uniforms.uGlassBrightnessBoost = { value: CONFIG.glassBrightnessBoost };
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <output_fragment>',
                `#ifdef USE_TRANSMISSION
gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * (1.0 + uGlassBrightnessBoost), transmission);
#endif
#include <output_fragment>`
            );
        };
        return mat;
    }, []);

    const transitionState = useRef({ 
        active: false, 
        from: isGlass ? 'glass' : 'sun', 
        to: isGlass ? 'glass' : 'sun', 
        start: 0 
    });

    useEffect(() => {
        if (introActive) return;
        const nextMode = isGlass ? 'glass' : 'sun';
        const currentMode = transitionState.current.to;
        if (nextMode !== currentMode) {
            transitionState.current = { 
                active: true, 
                from: currentMode, 
                to: nextMode, 
                start: performance.now() 
            };
        }
    }, [isGlass, introActive]);

    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

    useFrame((state) => {
        if (!meshRef.current) return;

        const angleToCamera = Math.atan2(camera.position.x - meshRef.current.position.x, camera.position.z - meshRef.current.position.z);
        meshRef.current.rotation.y = angleToCamera;

        // --- Hide Animation Logic (Overrides everything else) ---
        if (isHideActive || (hideAnimation && hideAnimation.isFullyHidden)) {
            meshRef.current.scale.setScalar(coreScale);
            
            if (isGlass) {
                meshRef.current.material = glassMaterial;
                glassMaterial.roughness = THREE.MathUtils.lerp(0.0, 0.8, coreBlur);
                glassMaterial.transmission = THREE.MathUtils.lerp(0.99, 0.5, coreBlur);
                glassMaterial.opacity = coreOpacity;
                if (lightRef.current) {
                    lightRef.current.intensity = CONFIG.coreLightGlass * coreOpacity;
                    lightRef.current.color.setHex(0xffffff);
                }
            } else {
                meshRef.current.material = sunMaterial;
                sunMaterial.emissiveIntensity = CONFIG.sunEmissiveTarget * coreOpacity;
                sunMaterial.opacity = coreOpacity;
                if (lightRef.current) {
                    lightRef.current.intensity = CONFIG.coreLightSun * coreOpacity;
                    lightRef.current.color.setHex(CONFIG.coreColor);
                }
            }
            return;
        }

        // --- Normal behavior if not hiding ---
        // Reset properties that might have been changed by hide animation
        if (isGlass) {
            glassMaterial.roughness = 0;
            glassMaterial.transmission = 0.99;
            glassMaterial.opacity = 1;
        } else {
            sunMaterial.opacity = 1;
        }

        if (introActive) {
            const coreStart = 0.3;
            const coreEnd = 0.6;
            let coreP = 0;
            const progress = introProgressRef.current;
            if (progress >= coreStart) {
                coreP = Math.min((progress - coreStart) / (coreEnd - coreStart), 1.0);
            }
            const coreEased = easeOutQuart(coreP);
            const pulse = Math.sin(coreP * Math.PI * 2.0) * (1 - coreP) * 0.05; 
            
            meshRef.current.scale.setScalar(0.8 + coreEased * 0.2 + pulse);
            if (lightRef.current) {
                lightRef.current.intensity = coreEased * 10;
                lightRef.current.color.setHex(0xffffff);
            }
            meshRef.current.material = glassMaterial;
            return;
        }

        if (transitionState.current.active) {
            const elapsed = performance.now() - transitionState.current.start;
            const t = Math.min(elapsed / CONFIG.coreTransitionDuration, 1.0);
            const easedT = 1 - Math.pow(1 - t, 3);
            
            if (transitionState.current.to === 'sun') {
                meshRef.current.material = sunMaterial;
                sunMaterial.emissiveIntensity = THREE.MathUtils.lerp(0.15, CONFIG.sunEmissiveTarget, easedT);
                if (lightRef.current) {
                    lightRef.current.intensity = THREE.MathUtils.lerp(CONFIG.coreLightGlass, CONFIG.coreLightSun, easedT);
                    lightRef.current.color.setHex(0xffffff).lerp(new THREE.Color(CONFIG.coreColor), easedT);
                }
                meshRef.current.scale.setScalar(1.0 + 0.05 * Math.sin(easedT * Math.PI));
            } else {
                meshRef.current.material = sunMaterial;
                sunMaterial.emissiveIntensity = THREE.MathUtils.lerp(CONFIG.sunEmissiveTarget, 0.1, easedT);
                if (lightRef.current) {
                    lightRef.current.intensity = THREE.MathUtils.lerp(CONFIG.coreLightSun, CONFIG.coreLightGlass, easedT);
                    lightRef.current.color.setHex(CONFIG.coreColor).lerp(new THREE.Color(0xffffff), easedT);
                }
                meshRef.current.scale.setScalar(1.02 - 0.02 * easedT);
                if (t >= 1.0) meshRef.current.material = glassMaterial;
            }
            if (t >= 1.0) transitionState.current.active = false;
        } else {
            meshRef.current.scale.setScalar(1.0);
            if (isGlass) {
                meshRef.current.material = glassMaterial;
                if (lightRef.current) {
                    lightRef.current.intensity = CONFIG.coreLightGlass;
                    lightRef.current.color.setHex(0xffffff);
                }
            } else {
                meshRef.current.material = sunMaterial;
                sunMaterial.emissiveIntensity = CONFIG.sunEmissiveTarget;
                if (lightRef.current) {
                    lightRef.current.intensity = CONFIG.coreLightSun;
                    lightRef.current.color.setHex(CONFIG.coreColor);
                }
            }
        }
    });

    return (
        <group>
            <mesh ref={meshRef} geometry={useMemo(() => new THREE.SphereGeometry(CONFIG.coreRadius, 64, 64), [])}>
                <Eyes isGlass={isGlass} theme={theme} intro={intro} hideAnimation={hideAnimation} />
            </mesh>
            <pointLight ref={lightRef} position={[0, 0, 0]} layers={[1]} />
        </group>
    );
});
