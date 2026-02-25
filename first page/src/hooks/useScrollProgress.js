import { useState, useEffect, useRef } from 'react';
import { ANIMATION_CONFIG } from '../config/constants';

export function useScrollProgress(containerRef) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollProgressRef = useRef(0);
  const targetProgressRef = useRef(0);

  // Update ref when scrollProgress changes
  useEffect(() => {
    scrollProgressRef.current = scrollProgress;
  }, [scrollProgress]);

  // Animate scroll progress smoothly
  useEffect(() => {
    let animationId = null;
    
    const animate = () => {
      const current = scrollProgressRef.current;
      const target = targetProgressRef.current;
      
      if (Math.abs(current - target) > ANIMATION_CONFIG.SCROLL_THRESHOLD) {
        const newProgress = current + (target - current) * ANIMATION_CONFIG.SCROLL_ANIMATION_SPEED;
        setScrollProgress(newProgress);
        animationId = requestAnimationFrame(animate);
      } else {
        animationId = null;
      }
    };
    
    const startAnimation = () => {
      if (animationId === null) {
        animationId = requestAnimationFrame(animate);
      }
    };
    
    const intervalId = setInterval(() => {
      const current = scrollProgressRef.current;
      const target = targetProgressRef.current;
      if (Math.abs(current - target) > ANIMATION_CONFIG.SCROLL_THRESHOLD && animationId === null) {
        startAnimation();
      }
    }, ANIMATION_CONFIG.SCROLL_CHECK_INTERVAL);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      clearInterval(intervalId);
    };
  }, []);

  // Handle scroll events
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight - container.clientHeight;
      const progress = scrollHeight > 0 ? Math.min(scrollTop / scrollHeight, 1) : 0;
      
      setScrollProgress(progress);
      targetProgressRef.current = progress;
    };

    const handleWheel = (e) => {
      const container = containerRef.current;
      if (!container) return;
      
      const scrollTop = container.scrollTop;
      const section1Height = container.children[0]?.offsetHeight || 0;
      const isInSection1 = scrollTop < section1Height - 50;
      const scrollingDown = e.deltaY > 0;
      const currentProgress = scrollProgressRef.current;
      
      if (isInSection1) {
        if (scrollingDown && currentProgress < 1.0) {
          e.preventDefault();
          e.stopPropagation();
          const increment = Math.min(e.deltaY * 0.001, 1.0 - currentProgress);
          targetProgressRef.current = Math.min(currentProgress + increment, 1.0);
          return false;
        } else if (!scrollingDown && currentProgress > ANIMATION_CONFIG.SCROLL_THRESHOLD) {
           e.preventDefault();
           e.stopPropagation();
           const decrement = Math.max(e.deltaY * 0.001, -currentProgress);
           targetProgressRef.current = Math.max(currentProgress + decrement, 0.0);
           return false;
        }
      }
    };

    const handleTouchMove = (e) => {
      const container = containerRef.current;
      if (!container) return;
      
      const scrollTop = container.scrollTop;
      const section1Height = container.children[0]?.offsetHeight || 0;
      const isInSection1 = scrollTop < section1Height - 50;
      const currentProgress = scrollProgressRef.current;
      
      if (isInSection1 && currentProgress < 1.0) {
        const touch = e.touches[0];
        const lastTouch = container.lastTouchY || touch.clientY;
        const scrollingDown = touch.clientY < lastTouch;
        container.lastTouchY = touch.clientY;
        
        if (scrollingDown) {
          e.preventDefault();
          const increment = 0.02;
          targetProgressRef.current = Math.min(currentProgress + increment, 1.0);
          return false;
        }
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    handleScroll();

    return () => {
      container.removeEventListener('scroll', handleScroll);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, [containerRef]);

  return { scrollProgress };
}

