// useScrollText.ts
// Sets --scroll-distance on a ref element so the CSS marquee knows how far to translate.
import { useEffect, useRef } from "react";

export function useScrollText<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const overflow = el.scrollWidth - el.clientWidth;
      el.style.setProperty("--scroll-distance", `${overflow > 0 ? overflow : 0}px`);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return ref;
}