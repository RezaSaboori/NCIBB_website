import React, { Suspense, memo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { CoreSphere } from './CoreSphere';
import { OrbitSystem } from './OrbitSystem';
import { PostProcessing } from './PostProcessing';
import { useIntroAnimation } from '../hooks/useIntroAnimation';
import { useCoreHideAnimation } from '../hooks/useCoreHideAnimation';
import { useCssBackground } from '../hooks/useCssBackground';
import { useBotPixelRatio } from '../hooks/useBotPixelRatio';
import { INTRO_CAMERA } from '../config/sceneConfig';

const GL_CONFIG = {
    antialias: true,
    powerPreference: 'high-performance',
    // Let the CSS background show through until the scene has a frame to display.
    alpha: true,
};

const ORBIT_CONFIG = {
    enableZoom:   false,   // set true/false to toggle scroll-wheel zoom
    enablePan:    false,   // set true/false to toggle pan (right-click drag)
    enableRotate: true,    // set true/false to toggle mouse drag rotation
};

const SceneContent = memo(({ theme, isGlass, isCoreVisible, ignition, setIntroActive, cssBackground }) => {
    const intro = useIntroAnimation(3800, () => setIntroActive(false));
    const hideAnimation = useCoreHideAnimation(isCoreVisible);

    return (
        <>
            <hemisphereLight
                args={[0xffffff, 0x444444, 0.5]}
                position={[0, 20, 0]}
                layers={[0, 1]}
            />
            <directionalLight
                args={[0xffffff, 1.0]}
                position={[10, 50, 20]}
                layers={[0, 1]}
            />

            {intro.isFinished && (
                <OrbitControls
                    enableDamping
                    target={[0, 0, 0]}
                    enableZoom={ORBIT_CONFIG.enableZoom}
                    enablePan={ORBIT_CONFIG.enablePan}
                    enableRotate={ORBIT_CONFIG.enableRotate}
                />
            )}

            {/* The glass material refracts the scene background. */}
            <color attach="background" args={[cssBackground]} />
            
            <Suspense fallback={null}>
                <EnvironmentMap color={theme.currentTheme.envBackground} />
            </Suspense>

            <CoreSphere
                isGlass={isGlass}
                theme={theme}
                intro={intro}
                hideAnimation={hideAnimation}
            />
            
            <OrbitSystem
                theme={theme}
                ignition={ignition}
                intro={intro}
            />

            {/* The full-screen bloom pass can flash black while the orbits appear. */}
            {intro.isFinished && <PostProcessing theme={theme} />}
        </>
    );
});

const EnvironmentMap = memo(({ color }) => (
    <Environment map={null}>
        <mesh scale={100}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color={color} side={THREE.BackSide} />
        </mesh>
    </Environment>
));

export const HarmonicDensity = memo(({ theme, isGlass, isCoreVisible, ignition, setIntroActive }) => {
    const { css: cssBackground } = useCssBackground();
    const pixelRatio = useBotPixelRatio();

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            backgroundColor: 'var(--color-gray2)',
        }}>
            <Canvas
                flat
                gl={GL_CONFIG}
                camera={INTRO_CAMERA}
                dpr={pixelRatio}
                resize={{ scroll: false, debounce: 0 }}
            >
                <SceneContent
                    theme={theme}
                    isGlass={isGlass}
                    isCoreVisible={isCoreVisible}
                    ignition={ignition}
                    setIntroActive={setIntroActive}
                    cssBackground={cssBackground}
                />
            </Canvas>
        </div>
    );
});
