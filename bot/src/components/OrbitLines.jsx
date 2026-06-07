import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { extend, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Line2 } from 'three-stdlib';
import { LineGeometry } from 'three-stdlib';
import { LineMaterial } from 'three-stdlib';
import { CONFIG } from '../config/sceneConfig';

extend({ Line2, LineGeometry, LineMaterial });

export const OrbitLines = ({ orbits, theme, rippleOffsets, intro }) => {
    const { size } = useThree();
    const { active: introActive, progressRef: introProgressRef } = intro;
    
    const lines = useMemo(() => orbits.map((orbit) => {
        const points = orbit.curve.getPoints(512);
        const positions = [];
        points.forEach(p => { positions.push(p.x, p.y, p.z); });
        positions.push(positions[0], positions[1], positions[2]); // Close loop
        return positions;
    }), [orbits]);

    // Create a single shared material instance and reuse it for all lines
    const orbitMaterial = useMemo(() => {
        const mat = new LineMaterial({
            color: theme.currentTheme.orbitColor,
            linewidth: CONFIG.orbitThickness,
            transparent: false,
            depthWrite: true,
        });
        mat.onBeforeCompile = (shader) => {
            shader.fragmentShader = `
                float random(vec2 co) {
                    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
                }
            ` + shader.fragmentShader;

            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <dithering_fragment>',
                `
                #include <dithering_fragment>
                float dist = 1.0 / gl_FragCoord.w; 
                float fadeStart = 22.0;
                float fadeEnd = 38.0;
                float density = 1.0 - smoothstep(fadeStart, fadeEnd, dist);
                float noise = random(gl_FragCoord.xy);
                if (noise > density) discard;
                `
            );
        };
        return mat;
    }, [theme.currentTheme.orbitColor]);

    const lineGroupRef = useRef();

    useFrame(() => {
        if (!lineGroupRef.current) return;
        
        let orbitProgress = 0;
        if (introActive) {
            const start = 0.35;
            const end = 0.7;
            const progress = introProgressRef.current;
            if (progress >= start) {
                orbitProgress = Math.min((progress - start) / (end - start), 1.0);
            }
        }

        lineGroupRef.current.children.forEach((line, i) => {
            line.position.y = rippleOffsets.current[i];
            
            if (introActive) {
                const orbitDelay = (i / orbits.length) * 0.3;
                const individualP = Math.max(0, Math.min(1, (orbitProgress - orbitDelay) / (1 - orbitDelay)));
                if (individualP > 0.01) {
                    line.visible = true;
                    line.scale.setScalar(easeOutCubic(individualP));
                } else {
                    line.visible = false;
                }
            } else {
                line.visible = true;
                line.scale.setScalar(1.0);
            }
        });
    });

    return (
        <group ref={lineGroupRef}>
            {orbits.map((orbit, i) => (
                <line2 key={i}>
                    <lineGeometry onUpdate={(self) => self.setPositions(lines[i])} />
                    <primitive object={orbitMaterial} attach="material" />
                </line2>
            ))}
        </group>
    );
};

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
