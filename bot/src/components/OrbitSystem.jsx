import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG } from '../config/sceneConfig';
import { WavyOrbitCurve } from '../utils/WavyOrbitCurve';
import { OrbitLines } from './OrbitLines';
import { ParticleInstances } from './ParticleInstances';

export const OrbitSystem = ({ theme, ignition, intro }) => {
    const orbitYOffset = CONFIG.coreRadius * CONFIG.orbitVerticalOffset;
    
    const orbits = useMemo(() => {
        const result = [];
        for (let i = 0; i < CONFIG.orbitCount; i++) {
            const radius = CONFIG.baseRadius + (i * CONFIG.radiusSpacing);
            const curve = new WavyOrbitCurve(radius, CONFIG.orbitShapeAmplitude, CONFIG.orbitShapeFrequency, i * 0.3);
            result.push({ index: i, radius, curve });
        }
        return result;
    }, []);

    const rippleOffsets = useRef(new Array(CONFIG.orbitCount).fill(0));

    useFrame((state) => {
        const time = state.clock.elapsedTime;
        for (let i = 0; i < CONFIG.orbitCount; i++) {
            const dist = i;
            const decay = Math.exp(-dist * CONFIG.waveDecay);
            const rippleY = Math.sin(dist * CONFIG.waveFrequency - time * CONFIG.waveSpeed) * (CONFIG.waveHeight * decay);
            rippleOffsets.current[i] = rippleY;
        }
    });

    return (
        <group position={[0, orbitYOffset, 0]}>
            <OrbitLines 
                orbits={orbits} 
                theme={theme} 
                rippleOffsets={rippleOffsets} 
                intro={intro}
            />
            <ParticleInstances 
                orbits={orbits} 
                theme={theme} 
                ignition={ignition} 
                rippleOffsets={rippleOffsets}
                intro={intro}
            />
        </group>
    );
};
