import { useEffect } from 'react';

export function useCanvasMouseForwarding(sectionRef, canvasRef, enabled) {
  useEffect(() => {
    const section1 = sectionRef.current;
    if (!enabled || !section1) return;

    let isForwarding = false;

    const forwardMouseMove = (e) => {
      const canvas = canvasRef.current;
      if (!canvas || isForwarding || e.target === canvas) return;

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
  }, [sectionRef, canvasRef, enabled]);
}
