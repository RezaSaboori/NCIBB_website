import React, { Suspense, useMemo, memo, useState } from 'react';
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
    enableZoom:   false,
    enablePan:    false,
    enableRotate: true,
};

const SceneContent = memo(({ theme, isGlass, isCoreVisible, ignition, setIntroActive, cssBackground, onIntroFinished }) => {
    const intro = useIntroAnimation(3800, () => {
        setIntroActive(false);
        onIntroFinished();
    });
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

            <color attach="background" args={[cssBackground.css]} />

            <Suspense fallback={null}>
                <EnvironmentMap color={theme.currentTheme.envBackground} />
            </Suspense>

            <CoreSphere
                isGlass={isGlass}
                theme={theme}
                intro={intro}
                hideAnimation={hideAnimation}
            />
            <OrbitSystem theme={theme} ignition={ignition} intro={intro} />
            <PostProcessing theme={theme} introActive={intro.active} cssBackground={cssBackground.css} />
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
    const [introFinished, setIntroFinished] = useState(false);

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
            // Black while intro runs → canvas is also black at exposure=0 → zero mismatch
            // After intro: smooth 0.6s transition to real body background
            background: introFinished ? cssBackground.css : '#000000',
            transition: introFinished ? 'background-color 0.6s ease' : 'none',
        }}>
            <Canvas
                gl={glConfig}
                dpr={[1, 1.5]}
                resize={{ scroll: false, debounce: 0 }}
                onCreated={({ gl }) => {
                    gl.toneMappingExposure = 0.0001;
                    gl.autoClear = true;
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
                    onIntroFinished={() => setIntroFinished(true)}
                />
            </Canvas>
        </div>
    );
});