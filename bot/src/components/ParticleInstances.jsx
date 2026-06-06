import React, { useMemo, useRef, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG } from '../config/sceneConfig';

export const ParticleInstances = memo(({ orbits, theme, ignition, rippleOffsets, intro }) => {
    const meshRef = useRef();
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const { active: introActive, progressRef: introProgressRef } = intro;
    
    const particles = useMemo(() => {
        const data = [];
        orbits.forEach((orbit) => {
            const count = Math.floor(2 * Math.PI * orbit.radius * CONFIG.particleDensity);
            const occupiedSegments = [];
            const orbitSpeed = (CONFIG.speed / orbit.radius) * 5;

            for (let j = 0; j < count; j++) {
                let attempts = 0;
                let valid = false;
                let angle = 0;
                let scale = 0;
                let angularRadius = 0;
                
                while (!valid && attempts < 20) {
                    angle = Math.random() * Math.PI * 2;
                    scale = 0.5 + Math.random() * 1.5;
                    const physicalWidth = (CONFIG.baseParticleSize * scale) * CONFIG.spacingBuffer;
                    angularRadius = physicalWidth / orbit.radius;
                    valid = true;
                    for (let k = 0; k < occupiedSegments.length; k++) {
                        const other = occupiedSegments[k];
                        let diff = Math.abs(angle - other.angle);
                        if (diff > Math.PI) diff = (Math.PI * 2) - diff;
                        if (diff < (angularRadius + other.angularRadius)) {
                            valid = false;
                            break;
                        }
                    }
                    attempts++;
                }

                if (valid) {
                    occupiedSegments.push({ angle, angularRadius });
                    data.push({
                        orbitIndex: orbit.index,
                        baseAngle: angle,
                        currentAngle: angle,
                        speed: orbitSpeed,
                        scale: scale,
                        currentScale: 0,
                        ignitionRandom: Math.random()
                    });
                }
            }
        });
        return data;
    }, [orbits]);

    // Use a custom ignition color that pops in light mode
    const ignitionColor = useMemo(() => {
        return theme.isDarkMode ? CONFIG.lightColor : new THREE.Color(0xff7700);
    }, [theme.isDarkMode]);

    const material = useMemo(() => {
        const mat = new THREE.MeshStandardMaterial({
            color: theme.currentTheme.particleColor,
            metalness: 0.9,
            roughness: 0.1,
            envMapIntensity: 1.0
        });

        mat.onBeforeCompile = (shader) => {
            shader.uniforms.ignitionThreshold = { value: 0.0 };
            shader.uniforms.ignitionColor = { value: ignitionColor };
            
            shader.vertexShader = `
                attribute float aIgnitionRandom;
                varying float vIgnitionRandom;
                ${shader.vertexShader}
            `.replace('#include <begin_vertex>', `#include <begin_vertex>\nvIgnitionRandom = aIgnitionRandom;`);

            shader.fragmentShader = `
                uniform float ignitionThreshold;
                uniform vec3 ignitionColor;
                varying float vIgnitionRandom;
                ${shader.fragmentShader}
            `.replace(
                '#include <emissivemap_fragment>',
                `#include <emissivemap_fragment>
                // Organic ignition transition with smoother step
                float strength = smoothstep(vIgnitionRandom, vIgnitionRandom + 0.12, ignitionThreshold);
                
                if (strength > 0.0) {
                    // Calculate 3D spherical gradient (Core vs Rim) using normals
                    // vNormal is passed from vertex shader in standard material
                    // We need to ensure it is normalized in view space
                    vec3 normal = normalize(vNormal);
                    vec3 viewDir = vec3(0.0, 0.0, 1.0); // Approximate view dir in view space is +Z
                    
                    // Dot product gives us alignment with camera (1.0 = center, 0.0 = edge)
                    float dotNV = max(0.0, dot(normal, viewDir));
                    
                    // Thermal Gradient Logic:
                    // Center is hotter (mix towards white/yellow)
                    // Edge is cooler (pure ignition color)
                    float coreHeat = pow(dotNV, 2.0); // Sharpen the core
                    
                    // Mix ignition color with a hot white/yellow core
                    vec3 hotCore = mix(ignitionColor, vec3(1.0, 0.95, 0.8), coreHeat * 0.6);
                    
                    // Add intensity boost for the bloom effect
                    float intensity = 5.5 + (coreHeat * 2.0);
                    
                    totalEmissiveRadiance += hotCore * strength * intensity;
                }
                `
            );
            mat.userData.shader = shader;
        };
        return mat;
    }, [theme.currentTheme.particleColor, ignitionColor]);

    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

    useFrame(() => {
        if (!meshRef.current) return;
        if (material.userData.shader) {
            material.userData.shader.uniforms.ignitionThreshold.value = ignition;
            material.userData.shader.uniforms.ignitionColor.value = ignitionColor;
        }

        let particleProgress = 0;
        if (introActive) {
            const start = 0.1;
            const end = 0.5;
            const progress = introProgressRef.current;
            if (progress >= start) {
                particleProgress = Math.min((progress - start) / (end - start), 1.0);
            }
        }

        particles.forEach((p, i) => {
            const curve = orbits[p.orbitIndex].curve;
            p.currentAngle += p.speed * 0.016;
            const t = (p.currentAngle / (Math.PI * 2)) % 1;
            const pos = curve.getPoint(t);
            pos.y += rippleOffsets.current[p.orbitIndex];

            if (introActive) {
                const spawnDelay = (p.orbitIndex / CONFIG.orbitCount) * 0.5;
                const individualP = Math.max(0, Math.min(1, (particleProgress - spawnDelay) / (1 - spawnDelay)));
                p.currentScale = p.scale * easeOutQuart(individualP);
            } else {
                p.currentScale = p.scale;
            }

            dummy.position.copy(pos);
            dummy.scale.setScalar(p.currentScale);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    const ignitionRandomAttr = useMemo(() => {
        const attr = new Float32Array(particles.length);
        particles.forEach((p, i) => attr[i] = p.ignitionRandom);
        return attr;
    }, [particles]);

    return (
        <instancedMesh 
            ref={meshRef} 
            args={[null, null, particles.length]} 
            frustumCulled={!introActive}
        >
            <sphereGeometry args={[CONFIG.baseParticleSize, 32, 32]}>
                <instancedBufferAttribute attach="attributes-aIgnitionRandom" args={[ignitionRandomAttr, 1]} />
            </sphereGeometry>
            <primitive object={material} attach="material" />
        </instancedMesh>
    );
});
