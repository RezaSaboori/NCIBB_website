import { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG } from '../config/sceneConfig';

export const useAttentionTracking = () => {
    const { camera, mouse: fiberMouse } = useThree();
    const targetPos = useRef(new THREE.Vector3(0, 0, 10));
    const currentTargetPos = useRef(new THREE.Vector3(0, 0, 10));
    const isUserActive = useRef(false);
    const lastMouseMoveTime = useRef(0);
    const lookAtRef = useRef({ x: 0, y: 0 });

    const interactionPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
    const raycaster = useMemo(() => new THREE.Raycaster(), []);

    useEffect(() => {
        const handleMouseMove = () => {
            lastMouseMoveTime.current = performance.now();
            isUserActive.current = true;
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useFrame((state) => {
        const now = performance.now();
        const time = state.clock.elapsedTime;

        if (isUserActive.current && (now - lastMouseMoveTime.current > 1500)) {
            isUserActive.current = false;
        }

        let lerpFactor = 0.03;

        if (isUserActive.current) {
            interactionPlane.normal.copy(camera.position).normalize();
            raycaster.setFromCamera(fiberMouse, camera);
            raycaster.ray.intersectPlane(interactionPlane, targetPos.current);
            lerpFactor = 0.15;
        } else {
            // Idle movement - slow circle or similar
            targetPos.current.set(
                Math.sin(time * 0.5) * 5,
                Math.cos(time * 0.3) * 5,
                10
            );
            lerpFactor = 0.03;
        }

        currentTargetPos.current.lerp(targetPos.current, lerpFactor);
        
        const tempVec = currentTargetPos.current.clone().project(camera);
        const jitterX = (Math.random() - 0.5) * 0.005;
        const jitterY = (Math.random() - 0.5) * 0.005;
        
        lookAtRef.current = {
            x: THREE.MathUtils.clamp(tempVec.x * 0.5 + jitterX, -0.3, 0.3),
            y: THREE.MathUtils.clamp(tempVec.y * 0.5 + jitterY, -0.2, 0.2)
        };
    });

    return lookAtRef;
};
