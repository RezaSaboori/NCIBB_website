import React, { useMemo } from 'react';
import { Line2, LineGeometry, LineMaterial } from 'three-stdlib';
import { useFrame } from '@react-three/fiber';
import { CONFIG } from '../config/sceneConfig';

export const OrbitLines = React.memo(({ orbits, theme, rippleOffsets, intro }) => {
    const { active: introActive, progressRef: introProgressRef } = intro;
    
    const material = useMemo(() => {
        const mat = new LineMaterial({
            color: theme.currentTheme.orbitColor,
            linewidth: CONFIG.orbitThickness,
            dashed: false,
            transparent: true,
            opacity: 0.6,
        });

        // Custom fragment shader for noise-based density fading
        mat.onBeforeCompile = (shader) => {
            shader.fragmentShader = `
                uniform float time;
                ${shader.fragmentShader}
            `.replace(
                '#include <clipping_planes_fragment>',
                `
                #include <clipping_planes_fragment>
                
                // Noise-based density fading
                float densityFade = 0.5 + 0.5 * sin(gl_FragCoord.x * 0.05 + time) * sin(gl_FragCoord.y * 0.05 + time);
                gl_FragColor.a *= densityFade;
                `
            );
            mat.userData.shader = shader;
        };
        return mat;
    }, [theme.currentTheme.orbitColor]);

    useFrame((state) => {
        if (material.userData.shader) {
            material.userData.shader.uniforms.time = { value: state.clock.elapsedTime };
        }
    });

    return (
        <>
            {orbits.map((orbit, i) => {
                const geometry = new LineGeometry();
                const points = orbit.curve.getPoints(64);
                const positions = new Float32Array(points.length * 3);
                for (let j = 0; j < points.length; j++) {
                    positions[j * 3] = points[j].x;
                    positions[j * 3 + 1] = points[j].y + rippleOffsets.current[i];
                    positions[j * 3 + 2] = points[j].z;
                }
                geometry.setPositions(positions);

                // Intro animation: progressive visibility with delay per orbit
                let opacity = 1;
                if (introActive) {
                    const start = 0.1 + (i / CONFIG.orbitCount) * 0.2;
                    const end = 0.3 + (i / CONFIG.orbitCount) * 0.3;
                    const progress = introProgressRef.current;
                    if (progress < start) {
                        opacity = 0;
                    } else if (progress < end) {
                        const t = (progress - start) / (end - start);
                        opacity = Math.min(t * t, 1);
                    }
                }

                return (
                    <line key={orbit.index}>
                        <primitive object={geometry} attach="geometry" />
                        <primitive object={material} attach="material" />
                    </line>
                );
            })}
        </>
    );
});

OrbitLines.displayName = 'OrbitLines';
