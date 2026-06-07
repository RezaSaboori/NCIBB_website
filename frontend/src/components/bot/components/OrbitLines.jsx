// frontend/src/components/bot/components/OrbitLines.jsx
import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { extend, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Line2, LineGeometry, LineMaterial } from 'three-stdlib';
import { CONFIG } from '../config/sceneConfig';

extend({ Line2, LineGeometry, LineMaterial }); // ✅ Register fat-line primitives

export const OrbitLines = React.memo(({ orbits, theme, rippleOffsets, intro }) => {
    const { size } = useThree(); // ✅ For resolution
    const { active: introActive, progressRef: introProgressRef } = intro;
    const materialRef = useRef();
    const lineGroupRef = useRef();

    // ✅ Pre-compute geometry ONCE, not every frame
    const lines = useMemo(() => orbits.map((orbit) => {
        const points = orbit.curve.getPoints(512); // ✅ 512 for smooth curves
        const positions = [];
        points.forEach(p => { positions.push(p.x, p.y, p.z); });
        positions.push(positions[0], positions[1], positions[2]); // ✅ Close loop
        return positions;
    }), [orbits]);

    useLayoutEffect(() => {
        if (!materialRef.current) return;
        materialRef.current.onBeforeCompile = (shader) => {
            // density-fade shader (copy from demo)
            shader.fragmentShader = `float random(vec2 co){return fract(sin(dot(co.xy,vec2(12.9898,78.233)))*43758.5453);}` + shader.fragmentShader;
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <dithering_fragment>',
                `#include <dithering_fragment>
                float dist = 1.0 / gl_FragCoord.w;
                float fadeStart = 22.0; float fadeEnd = 38.0;
                float density = 1.0 - smoothstep(fadeStart, fadeEnd, dist);
                float noise = random(gl_FragCoord.xy);
                if (noise > density) discard;`
            );
        };
    }, []);

    useFrame(() => {
        if (!lineGroupRef.current) return;
        let orbitProgress = 0;
        if (introActive) {
            const start = 0.35, end = 0.7;
            const progress = introProgressRef.current;
            if (progress >= start) orbitProgress = Math.min((progress - start) / (end - start), 1.0);
        }
        lineGroupRef.current.children.forEach((line, i) => {
            line.position.y = rippleOffsets.current[i];
            if (introActive) {
                const delay = (i / orbits.length) * 0.3;
                const p = Math.max(0, Math.min(1, (orbitProgress - delay) / (1 - delay)));
                line.visible = p > 0.01;
                if (line.visible) line.scale.setScalar(1 - Math.pow(1 - p, 3));
            } else {
                line.visible = true;
                line.scale.setScalar(1.0);
            }
        });
    });

    return (
        <group ref={lineGroupRef}>
            {orbits.map((orbit, i) => (
                <line2 key={i}> {/* ✅ fat line */}
                    <lineGeometry onUpdate={(self) => self.setPositions(lines[i])} />
                    <lineMaterial
                        ref={i === 0 ? materialRef : undefined}
                        color={theme.currentTheme.orbitColor}
                        linewidth={CONFIG.orbitThickness}
                        resolution={[size.width, size.height]} // ✅ required
                        depthWrite={true}
                        depthTest={true}
                    />
                </line2>
            ))}
        </group>
    );
});