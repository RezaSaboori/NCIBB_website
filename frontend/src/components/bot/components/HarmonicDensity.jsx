import React, { Suspense, useMemo, memo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { CoreSphere } from './CoreSphere';
import { OrbitSystem } from './OrbitSystem';
import { PostProcessing } from './PostProcessing';
import { useIntroAnimation } from '../hooks/useIntroAnimation';
import { useCoreHideAnimation } from '../hooks/useCoreHideAnimation';

const SceneContent = memo(({ theme, isGlass, isCoreVisible, ignition, setIntroActive }) => {
    const intro = useIntroAnimation(3800, () => setIntroActive(false));
    const hideAnimation = useCoreHideAnimation(isCoreVisible);
    const { currentTheme } = theme;

    // Convert hex background to CSS/Three string for the background color
    const bgColor = useMemo(() => {
        // During intro, stay black. After intro, follow theme.
        if (intro.active) return '#000000';
        return `#${currentTheme.background.toString(16).padStart(6, '0')}`;
    }, [intro.active, currentTheme.background]);

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

            {intro.isFinished && <OrbitControls enableDamping target={[0, 0, 0]} />}

            {/* Set background color directly in the scene */}
            <color attach="background" args={[bgColor]} />
            
            <Suspense fallback={null}>
                <EnvironmentMap color={currentTheme.envBackground} />
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
            // Update wrapper background to match theme for seamless edges
            background: theme.isDarkMode ? '#000' : `#${theme.currentTheme.background.toString(16).padStart(6, '0')}`
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
                />
            </Canvas>
        </div>
    );
});
