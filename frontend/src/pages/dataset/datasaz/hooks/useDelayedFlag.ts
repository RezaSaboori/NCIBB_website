import { useState, useEffect, useRef } from "react";

/**
 * Returns true only when `active` has remained true for at least `delay` ms.
 * Returns false immediately when `active` becomes false.
 */
export const useDelayedFlag = (active: boolean, delay: number): boolean => {
  const [flag, setFlag] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!active) {
      setFlag(false);
      return;
    }
    timerRef.current = setTimeout(() => setFlag(true), delay);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [active, delay]);

  return flag;
};