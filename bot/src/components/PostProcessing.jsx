import React, { memo } from 'react';
import { EffectComposer, Bloom, SMAA, useFrame } from '@react-three/postprocessing';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG } from '../config/sceneConfig';

export const PostProcessing = memo(({ theme, introActive, cssBackground }) => {
    const { gl } = useThree();

    // useFrame runs BEFORE the frame is rendered — no flash frame
    useFrame(() => {
        const color = new THREE.Color(cssBackground || '#000000');
        gl.setClearColor(color, 1);
    }, -100); // low priority number = runs first

    return (
        <EffectComposer
            disableNormalPass
            multisampling={0}
            stencilBuffer={false}
            depthBuffer={true}
        >
            <Bloom
                intensity={theme.currentTheme.bloomStrength}
                luminanceThreshold={CONFIG.bloomThreshold}
                luminanceSmoothing={0.9}
                mipmapBlur
                radius={CONFIG.bloomRadius}
            />
            {/* Always mounted - SMAA enabled state handled internally */}
            <SMAA />
        </EffectComposer>
    );
});
