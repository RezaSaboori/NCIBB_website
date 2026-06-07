import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Shape, Text } from '@react-three/drei';
import * as THREE from 'three';

export const Eyes = ({ hideAnimation, intro, theme }) => {
    const { eyeCloseFactor, eyeOpacity } = hideAnimation;
    
    // Get blink and attention tracking from hooks
    const eyeScaleY = 1; // Placeholder - blinkFSM would be integrated here
    const lookAtRef = useRef(new THREE.Vector3(0, 0, 0));

    const eyeColor = theme.isDarkMode ? '#ffffff' : '#000000';
    const eyeWhiteMaterial = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            color: eyeColor,
            roughness: 0.3,
            metalness: 0.1,
            transparent: true,
            opacity: eyeOpacity,
        });
    }, [eyeColor, eyeOpacity]);

    const pupilMaterial = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            color: theme.isDarkMode ? '#000000' : '#ffffff',
            roughness: 0.1,
            metalness: 0.5,
        });
    }, [theme.isDarkMode]);

    const leftEyeRef = useRef();
    const rightEyeRef = useRef();

    useFrame((state) => {
        if (leftEyeRef.current && rightEyeRef.current) {
            // Apply eye closing scale
            leftEyeRef.current.scale.y = eyeCloseFactor;
            rightEyeRef.current.scale.y = eyeCloseFactor;

            // Update opacity
            if (leftEyeRef.current.material) {
                leftEyeRef.current.material.opacity = eyeOpacity;
            }
            if (rightEyeRef.current.material) {
                rightEyeRef.current.material.opacity = eyeOpacity;
            }

            // Pupil scaling
            const basePupilScale = 0.3 + 0.2 * Math.sin(state.clock.elapsedTime * 2);
            leftEyeRef.current.children?.[1]?.scale.setScalar(basePupilScale);
            rightEyeRef.current.children?.[1]?.scale.setScalar(basePupilScale);
        }
    });

    const eyeShape = `
        M 0,-10
        C 10,-10 10,-5 10,0
        C 10,5 10,10 0,10
        C -10,10 -10,5 -10,0
        C -10,-5 -10,-10 0,-10
        Z
    `;

    return (
        <group>
            {/* Left Eye */}
            <mesh ref={leftEyeRef} position={[-1.2, 0.8, 0.9]}>
                <shapeGeometry args={[eyeShape]} />
                <primitive object={eyeWhiteMaterial} attach="material" />
            </mesh>

            {/* Left Pupil */}
            <mesh position={[-1.2, 0.8, 1.05]}>
                <circleGeometry args={[0.3, 32]} />
                <primitive object={pupilMaterial} attach="material" />
            </mesh>

            {/* Right Eye */}
            <mesh ref={rightEyeRef} position={[1.2, 0.8, 0.9]}>
                <shapeGeometry args={[eyeShape]} />
                <primitive object={eyeWhiteMaterial} attach="material" />
            </mesh>

            {/* Right Pupil */}
            <mesh position={[1.2, 0.8, 1.05]}>
                <circleGeometry args={[0.3, 32]} />
                <primitive object={pupilMaterial} attach="material" />
            </mesh>
        </group>
    );
};
