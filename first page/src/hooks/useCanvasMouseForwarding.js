import { useEffect } from 'react';

export function useCanvasMouseForwarding(sectionRef, canvasRef) {
  useEffect(() => {
    const section1 = sectionRef.current;
    const canvas = canvasRef.current;
    
    if (!section1 || !canvas) return;

    let isForwarding = false;

    const forwardMouseMove = (e) => {
      if (isForwarding || e.target === canvas) return;
      
      isForwarding = true;
      
      const syntheticEvent = new MouseEvent('mousemove', {
        bubbles: false,
        cancelable: true,
        clientX: e.clientX,
        clientY: e.clientY,
        screenX: e.screenX,
        screenY: e.screenY,
        button: e.button,
        buttons: e.buttons,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        metaKey: e.metaKey,
        relatedTarget: null,
        movementX: e.movementX,
        movementY: e.movementY,
      });
      
      canvas.dispatchEvent(syntheticEvent);
      isForwarding = false;
    };

    section1.addEventListener('mousemove', forwardMouseMove, { passive: true, capture: true });

    return () => {
      section1.removeEventListener('mousemove', forwardMouseMove, { capture: true });
    };
  }, [sectionRef, canvasRef]);
}

