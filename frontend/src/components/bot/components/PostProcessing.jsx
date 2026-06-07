import React, { memo } from 'react';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { CONFIG } from '../config/sceneConfig.js';

export const PostProcessing = memo(({ theme, introActive }) => {
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
        </EffectComposer>
    );
});
