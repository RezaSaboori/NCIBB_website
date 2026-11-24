import React, { useLayoutEffect, useMemo, useRef, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG } from '../config/sceneConfig';

const FULL_TURN = Math.PI * 2;
const MAX_PARTICLE_SCALE = 2;
// Each particle occupies only a few pixels at the orbit camera's distance.
const PARTICLE_GEOMETRY = [CONFIG.baseParticleSize, 12, 10];

export const ParticleInstances = memo(({ orbits, theme, ignition, rippleOffsets, intro }) => {
    const meshRef = useRef();
    const position = useMemo(() => new THREE.Vector3(), []);
    const matrix = useMemo(() => new THREE.Matrix4(), []);
    const { active: introActive, progressRef: introProgressRef } = intro;
    
    const particles = useMemo(() => {
        const data = [];
        orbits.forEach((orbit) => {
            const count = Math.floor(FULL_TURN * orbit.radius * CONFIG.particleDensity);
            const occupiedSegments = [];
            const orbitSpeed = (CONFIG.speed / orbit.radius) * 5;

            for (let j = 0; j < count; j++) {
                let attempts = 0;
                let valid = false;
                let angle = 0;
                let scale = 0;
                let angularRadius = 0;
                
                while (!valid && attempts < 20) {
                    angle = Math.random() * FULL_TURN;
                    scale = 0.5 + Math.random() * (MAX_PARTICLE_SCALE - 0.5);
                    const physicalWidth = (CONFIG.baseParticleSize * scale) * CONFIG.spacingBuffer;
                    angularRadius = physicalWidth / orbit.radius;
                    valid = true;
                    for (let k = 0; k < occupiedSegments.length; k++) {
                        const other = occupiedSegments[k];
                        let diff = Math.abs(angle - other.angle);
                        if (diff > Math.PI) diff = FULL_TURN - diff;
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
                        angle,
                        speed: orbitSpeed,
                        scale,
                        ignitionRandom: Math.random()
                    });
                }
            }
        });
        return data;
    }, [orbits]);

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
                float strength = smoothstep(vIgnitionRandom, vIgnitionRandom + 0.12, ignitionThreshold);
                
                if (strength > 0.0) {
                    vec3 normal = normalize(vNormal);
                    vec3 viewDir = vec3(0.0, 0.0, 1.0);
                    float dotNV = max(0.0, dot(normal, viewDir));
                    float coreHeat = pow(dotNV, 2.0);
                    vec3 hotCore = mix(ignitionColor, vec3(1.0, 0.95, 0.8), coreHeat * 0.6);
                    float intensity = 5.5 + (coreHeat * 2.0);
                    totalEmissiveRadiance += hotCore * strength * intensity;
                }
                `
            );
            mat.userData.shader = shader;
        };
        return mat;
    }, [theme.currentTheme.particleColor, ignitionColor]);

    useLayoutEffect(() => {
        const mesh = meshRef.current;
        mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        const outerRadius = Math.max(0, ...orbits.map((orbit) => orbit.radius));
        const padding = CONFIG.orbitShapeAmplitude + CONFIG.waveHeight + CONFIG.baseParticleSize * MAX_PARTICLE_SCALE;
        // Cover every orbit, including particles that have yet to appear.
        mesh.boundingSphere = new THREE.Sphere(new THREE.Vector3(), outerRadius + padding);
    }, [orbits, particles.length]);

    useFrame(({ clock }) => {
        const mesh = meshRef.current;
        if (!mesh) return;
        if (material.userData.shader) {
            material.userData.shader.uniforms.ignitionThreshold.value = ignition;
            material.userData.shader.uniforms.ignitionColor.value = ignitionColor;
        }

        const particleProgress = introActive
            ? THREE.MathUtils.clamp((introProgressRef.current - 0.1) / 0.4, 0, 1)
            : 1;
        const time = clock.elapsedTime;
        let visibleCount = 0;
        let orbitIndex = -1;
        let growth = 1;

        for (const particle of particles) {
            if (particle.orbitIndex !== orbitIndex) {
                orbitIndex = particle.orbitIndex;
                const delay = (orbitIndex / CONFIG.orbitCount) * 0.5;
                // Particles are ordered by orbit, so all later orbits are still hidden too.
                if (particleProgress <= delay) break;
                const progress = (particleProgress - delay) / (1 - delay);
                growth = 1 - Math.pow(1 - progress, 4);
            }

            const angle = particle.angle + particle.speed * time;
            orbits[orbitIndex].curve.getPoint((angle % FULL_TURN) / FULL_TURN, position);
            position.y += rippleOffsets.current[orbitIndex];
            const scale = particle.scale * growth;
            matrix.makeScale(scale, scale, scale).setPosition(position);
            mesh.setMatrixAt(visibleCount, matrix);
            visibleCount++;
        }

        mesh.count = visibleCount;
        if (visibleCount > 0) mesh.instanceMatrix.needsUpdate = true;
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
        >
            <sphereGeometry args={PARTICLE_GEOMETRY}>
                <instancedBufferAttribute attach="attributes-aIgnitionRandom" args={[ignitionRandomAttr, 1]} />
            </sphereGeometry>
            <primitive object={material} attach="material" />
        </instancedMesh>
    );
});
