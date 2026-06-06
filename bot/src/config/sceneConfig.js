import * as THREE from 'three';

export const CONFIG = {
    orbitCount: 25,
    baseRadius: 3,
    radiusSpacing: 0.3,
    particleDensity: 0.6, 
    baseParticleSize: 0.05,
    orbitThickness: 1.5,
    speed: 0.2,
    
    waveSpeed: 1.5,
    waveFrequency: 0.6,
    waveHeight: 0.2,
    waveDecay: 0.10,
    orbitShapeAmplitude: 0.05,
    orbitShapeFrequency: 12.0,
    
    coreRadius: 2.2,
    coreColor: 0xffaa33, 
    orbitVerticalOffset: -0.3, 
    glassBrightnessBoost: 0.35,

    // Core transitions and sun shaping
    coreTransitionDuration: 1100, // ms
    coreLightSun: 500,
    coreLightGlass: 10,
    sunEmissiveTarget: 4.0,

    eyeWidth: 0.18,
    eyeHeight: 0.45,
    eyeSeparation: 1,
    eyeBaseY: 0.5, 
    spacingBuffer: 2.5, 

    targetIgnition: 0.0,
    currentIgnition: 0.0, 
    lightColor: new THREE.Color(0xffddaa),
    
    bloomRadius: 0.8,
    bloomThreshold: 0.85,
};

