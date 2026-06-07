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
  const [animationState, setAnimationState] = useState({
    eyeCloseFactor: 1,
    eyeOpacity: 1,
    coreScale: 1,
    coreOpacity: 1,
    coreBlur: 0,
    isFullyHidden: !isVisible,
    isActive: false
  });

  const stateRef = useRef({
    hideProgress: isVisible ? 0 : 1, // 0 = visible, 1 = hidden
  });

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const easeInCubic = (t) => t * t * t;
  const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  useFrame((state, delta) => {
    const s = stateRef.current;
    const targetProgress = isVisible ? 0 : 1;
    
    if (s.hideProgress !== targetProgress) {
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

      setAnimationState({
        eyeCloseFactor,
        eyeOpacity,
        coreScale,
        coreOpacity,
        coreBlur,
        isFullyHidden: p === 1,
        isActive: p > 0 && p < 1
      });
    }
  });

  return animationState;
};

