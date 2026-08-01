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
      const overflow = inner.scrollWidth - wrapper.clientWidth;
      const hasOverflow = overflow > 0;
      wrapper.style.setProperty("--scroll-distance", `${hasOverflow ? overflow : 0}px`);
      // Drive the mask: 1 = text overflows (show fade), 0 = fits (no fade)
      wrapper.style.setProperty("--dz-scroll-overflow", hasOverflow ? "1" : "0");
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrapper);
    ro.observe(inner);
    return () => ro.disconnect();
  }, []);

  return { wrapperRef, innerRef };
}