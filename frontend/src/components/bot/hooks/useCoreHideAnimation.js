import { useRef, useState, useEffect } from 'react';
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
  const animationStateRef = useRef({
    eyeCloseFactor: 1,
    eyeOpacity: 1,
    coreScale: 1,
    coreOpacity: 1,
    coreBlur: 0,
    isFullyHidden: !isVisible,
    isActive: false
  });

  const stateRef = useRef({
    hideProgress: isVisible ? 0 : 1,
  });

  const [forceUpdate, setForceUpdate] = useState(0);

  // Update hideProgress immediately on isVisible change, but only trigger update when animation completes
  useEffect(() => {
    stateRef.current.hideProgress = isVisible ? 0 : 1;
  }, [isVisible]);

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const easeInCubic = (t) => t * t * t;
  const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  useFrame((state, delta) => {
    const s = stateRef.current;
    const targetProgress = isVisible ? 0 : 1;
    
    // Only animate if we're not already at the target
    if (Math.abs(s.hideProgress - targetProgress) > 0.001) {
      const step = (delta * 1000) / TOTAL_DURATION;
      if (s.hideProgress < targetProgress) {
        s.hideProgress = Math.min(s.hideProgress + step, 1);
      } else {
        s.hideProgress = Math.max(s.hideProgress - step, 0);
      }

      const p = s.hideProgress;
      let eyeCloseFactor = 1;
      let eyeOpacity = 1;
      let coreScale = 1;
      let coreOpacity = 1;
      let coreBlur = 0;

      // Stage 1: Eyes closing (0 to P1)
      if (p <= P1) {
        const stageP = p / P1;
        eyeCloseFactor = 1 - stageP;
      } 
      // Stage 2: Eyes fading (P1 to P2)
      else if (p <= P2) {
        const stageP = (p - P1) / (P2 - P1);
        eyeCloseFactor = 0;
        eyeOpacity = 1 - stageP;
      }
      // Stage 3: Core shrinking/blurring/fading (P2 to 1.0)
      else {
        const stageP = (p - P2) / (1 - P2);
        eyeCloseFactor = 0;
        eyeOpacity = 0;
        coreScale = THREE.MathUtils.lerp(1, 0.01, easeOutCubic(stageP));
        coreOpacity = 1 - easeInOutCubic(stageP);
        coreBlur = easeInCubic(stageP);
      }

      // Update ref values directly (no React re-render)
      animationStateRef.current = {
        eyeCloseFactor,
        eyeOpacity,
        coreScale,
        coreOpacity,
        coreBlur,
        isFullyHidden: p === 1,
        isActive: p > 0 && p < 1
      };

      // Trigger a re-render only at the end of animation to avoid every-frame re-renders
      // This is critical for performance - we just update values in the ref
    }
  });

  // Return the ref value for use in the component
  return animationStateRef.current;
};
