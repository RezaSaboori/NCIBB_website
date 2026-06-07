import React, { memo } from 'react';
import { EffectComposer, Bloom, SMAA } from '@react-three/postprocessing';
import { CONFIG } from '../config/sceneConfig.js';

export const PostProcessing = memo(({ theme, introActive }) => {
    return (
        <EffectComposer
            disableNormalPass
            multisampling={0}
            stencilBuffer={false}
            depthBuffer={false}
        >
            <Bloom 
                intensity={theme.currentTheme.bloomStrength}
                luminanceThreshold={CONFIG.bloomThreshold}
                luminanceSmoothing={0.9}
                mipmapBlur
                radius={CONFIG.bloomRadius}
            />
            {/* Only run SMAA if we have enough light to see it, 
                preventing artifacts in the dark beginning */}
            {!introActive && <SMAA />}
        </EffectComposer>
    );
});
