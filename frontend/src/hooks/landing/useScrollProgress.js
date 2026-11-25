import { useState, useEffect, useRef } from 'react';

export function useScrollProgress(enabled) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollProgressRef = useRef(0);
  const targetProgressRef = useRef(0);

  // Update ref when scrollProgress changes
  useEffect(() => {
    scrollProgressRef.current = scrollProgress;
  }, [scrollProgress]);

  // Animate scroll progress smoothly
  useEffect(() => {
    if (!enabled) return;
    let animationId = null;
    
    const animate = () => {
      const current = scrollProgressRef.current;
      const target = targetProgressRef.current;
      const diff = target - current;
      
      if (Math.abs(diff) > 0.0001) {
        // Use a more standard smoothing factor
        const step = diff * 0.1;
        const newProgress = current + step;
        setScrollProgress(newProgress);
        animationId = requestAnimationFrame(animate);
      } else {
        setScrollProgress(target);
        animationId = null;
      }
    };
    
    const startAnimation = () => {
      if (animationId === null) {
        animationId = requestAnimationFrame(animate);
      }
    };
    
    // Check for changes more frequently or trigger from events
    const intervalId = setInterval(() => {
      const current = scrollProgressRef.current;
      const target = targetProgressRef.current;
      if (Math.abs(target - current) > 0.0001 && animationId === null) {
        startAnimation();
      }
    }, 10);
    
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      clearInterval(intervalId);
    };
  }, [enabled]);

  // Handle scroll events
  useEffect(() => {
    if (!enabled) {
      targetProgressRef.current = 0;
      setScrollProgress(0);
      return;
    }

    let pastHeroStart = false;

    const handleScroll = () => {
      const pastStart = window.scrollY > 10;
      if (pastStart === pastHeroStart) return;

      pastHeroStart = pastStart;
      const progress = pastStart ? 1 : 0;
      targetProgressRef.current = progress;
      setScrollProgress(progress);
    };

    const handleWheel = (e) => {
      if (e.ctrlKey || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const scrollTop = window.scrollY;
      const currentProgress = scrollProgressRef.current;
      const scrollingDown = e.deltaY > 0;
      
      // If we are at the top, we manage the animation progress manually
      if (scrollTop <= 5) {
        // Condition to "scrolljack": 
        // 1. Scrolling down and animation not finished
        // 2. Scrolling up and animation not at start
        const isScrollingDownAndNotFinished = scrollingDown && currentProgress < 0.99;
        const isScrollingUpAndNotAtStart = !scrollingDown && currentProgress > 0.01;

        if (isScrollingDownAndNotFinished || isScrollingUpAndNotAtStart) {
          e.preventDefault();
          
          // Normalize and scale the scroll delta
          let delta = e.deltaY;
          if (e.deltaMode === 1) delta *= 40; // lines
          if (e.deltaMode === 2) delta *= window.innerHeight; // pages
          
          // Increase sensitivity significantly to rule out "not working"
          const increment = delta * 0.005;
          
          targetProgressRef.current = Math.min(Math.max(targetProgressRef.current + increment, 0.0), 1.0);
          return false;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: false });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [enabled]);

  return { scrollProgress };
}

