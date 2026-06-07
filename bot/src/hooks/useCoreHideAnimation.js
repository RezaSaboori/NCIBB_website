import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const DURATION = {
  EYES_CLOSE: 300,
  EYES_FADE: 200,
  CORE_HIDE: 800
};

const TOTAL_DURATION = DURATION.EYES_CLOSE + DURATION.EYES_FADE + DURATION.CORE_HIDE;

const P1 = DURATION.EYES_CLOSE / TOTAL_DURATION; // ~0.23
const P2 = (DURATION.EYES_CLOSE + DURATION.EYES_FADE) / TOTAL_DURATION; // ~0.38

export const useCoreHideAnimation = (isVisible) => {
  // Only two boolean state transitions — not per-frame
  const [isFullyHidden, setIsFullyHidden] = useState(!isVisible);
  const [isActive, setIsActive] = useState(false);

  // All animated values live in a ref — zero re-renders per frame
  const valuesRef = useRef({
    eyeCloseFactor: isVisible ? 1 : 0,
    eyeOpacity: isVisible ? 1 : 0,
    coreScale: isVisible ? 1 : 0.01,
    coreOpacity: isVisible ? 1 : 0,
    coreBlur: isVisible ? 0 : 1,
  });

  const hideProgressRef = useRef(isVisible ? 0 : 1);

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const easeInCubic = (t) => t * t * t;
  const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  useFrame((state, delta) => {
    const current = hideProgressRef.current;
    const targetProgress = isVisible ? 0 : 1;
    
    if (current === targetProgress) return;

    const step = (delta * 1000) / TOTAL_DURATION;
    hideProgressRef.current = current < targetProgress
      ? Math.min(current + step, 1)
      : Math.max(current - step, 0);

    const p = hideProgressRef.current;
    let eyeCloseFactor = 1;
    let eyeOpacity = 1;
    let coreScale = 1;
    let coreOpacity = 1;
    let coreBlur = 0;

    // Stage 1: Eyes closing (0 to P1)
    if (p <= P1) {
      const stageP = p / P1; // 0 (open) to 1 (closed)
      eyeCloseFactor = 1 - stageP; // 1 to 0
    } 
    // Stage 2: Eyes fading (P1 to P2)
    else if (p <= P2) {
      const stageP = (p - P1) / (P2 - P1); // 0 (visible) to 1 (invisible)
      eyeCloseFactor = 0;
      eyeOpacity = 1 - stageP; // 1 to 0
    }
    // Stage 3: Core shrinking/blurring/fading (P2 to 1.0)
    else {
      const stageP = (p - P2) / (1 - P2); // 0 (visible) to 1 (hidden)
      eyeCloseFactor = 0;
      eyeOpacity = 0;
      coreScale = THREE.MathUtils.lerp(1, 0.01, easeOutCubic(stageP));
      coreOpacity = 1 - easeInOutCubic(stageP);
      coreBlur = easeInCubic(stageP);
    }

    // Update ref values (no React re-render)
    valuesRef.current = {
      eyeCloseFactor,
      eyeOpacity,
      coreScale,
      coreOpacity,
      coreBlur,
    };

    // Only call setState at boundary transitions to signal done
    if (p === 0 && isActive) setIsActive(false);
    if (p === 1 && !isFullyHidden) { setIsFullyHidden(true); setIsActive(false); }
    if (p > 0 && p < 1 && !isActive) setIsActive(true);
  });

  // Return ref object directly — consumers read .current in their own useFrame
  return {
    valuesRef: valuesRef.current,
    isFullyHidden,
    isActive,
  };
};
