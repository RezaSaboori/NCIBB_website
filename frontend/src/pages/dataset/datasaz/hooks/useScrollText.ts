// useScrollText.ts
// Measures the overflow of the inner text span relative to the wrapper,
// and writes --scroll-distance onto the wrapper for the CSS marquee animation.
import { useEffect, useRef } from "react";

export function useScrollText<W extends HTMLElement, I extends HTMLElement>() {
  const wrapperRef = useRef<W>(null);
  const innerRef = useRef<I>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const inner = innerRef.current;
    if (!wrapper || !inner) return;

    const measure = () => {
      // inner.scrollWidth is the true rendered text width (no clipping).
      // wrapper.clientWidth is the visible clip zone width.
      const overflow = inner.scrollWidth - wrapper.clientWidth;
      wrapper.style.setProperty("--scroll-distance", `${overflow > 0 ? overflow : 0}px`);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrapper);
    ro.observe(inner);
    return () => ro.disconnect();
  }, []);

  return { wrapperRef, innerRef };
}