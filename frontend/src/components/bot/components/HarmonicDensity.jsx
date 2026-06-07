import React, { Suspense, useMemo, memo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { CoreSphere } from './CoreSphere';
import { OrbitSystem } from './OrbitSystem';
import { PostProcessing } from './PostProcessing';
import { useIntroAnimation } from '../hooks/useIntroAnimation';
import { useCoreHideAnimation } from '../hooks/useCoreHideAnimation';
import { useCssBackground } from '../hooks/useCssBackground';

const ORBIT_CONFIG = {
    enableZoom:   false,   // set true/false to toggle scroll-wheel zoom
    enablePan:    false,   // set true/false to toggle pan (right-click drag)
    enableRotate: true,    // set true/false to toggle mouse drag rotation
};

const SceneContent = memo(({ theme, isGlass, isCoreVisible, ignition, setIntroActive, cssBackground }) => {
    const intro = useIntroAnimation(3800, () => setIntroActive(false));
    const hideAnimation = useCoreHideAnimation(isCoreVisible);

    // Always use the real CSS background; intro darkness is handled by toneMappingExposure=0
    const bgColor = cssBackground.css;

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

            {/* Set background color directly in the scene */}
            <color attach="background" args={[bgColor]} />
            
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

            <PostProcessing theme={theme} introActive={intro.active} />
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
    const cssBackground = useCssBackground();

    const glConfig = useMemo(() => ({
        antialias: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        stencil: false,
        depth: true,
        alpha: false,
        preserveDrawingBuffer: false,
    }), []);

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            background: cssBackground.css
        }}>
            <Canvas
                gl={glConfig}
                dpr={[1, 1.5]}
                resize={{ scroll: false, debounce: 0 }}
                onCreated={({ gl }) => {
                    gl.toneMappingExposure = 0;
                    gl.autoClear = true;
                    // WebGL context loss recovery
                    gl.domElement.addEventListener('webglcontextlost', (e) => {
                        e.preventDefault();
                    }, false);
                }}
            >
                <PerspectiveCamera
                    makeDefault
                    fov={45}
                    near={0.1}
                    far={1000}
                    position={[35, 15, 35]}
                />

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
