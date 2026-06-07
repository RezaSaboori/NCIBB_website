import React, { memo, useEffect } from 'react';
import { EffectComposer, Bloom, SMAA } from '@react-three/postprocessing';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG } from '../config/sceneConfig';

export const PostProcessing = memo(({ theme, introActive, cssBackground }) => {
    const { gl } = useThree();

    // Sync WebGL clear color with scene background so EffectComposer
    // never reveals a black buffer underneath during transitions
    useEffect(() => {
        const color = new THREE.Color(introActive ? '#000000' : (cssBackground || '#000000'));
        gl.setClearColor(color, 1);
    }, [introActive, cssBackground, gl]);

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
            {/* Use enabled prop — never conditionally mount/unmount effects
                Mounting/unmounting forces EffectComposer to rebuild its pipeline → black flash */}
            <SMAA enabled={!introActive} />
        </EffectComposer>
    );
});
