import { useLayoutEffect, type RefObject } from "react";

export function useHeaderHeight(header: RefObject<HTMLElement>) {
  useLayoutEffect(() => {
    const toolbar = header.current;

    if (!toolbar) return;

    const rootStyle = document.documentElement.style;
    const updateHeight = () => {
      rootStyle.setProperty(
        "--site-header-height",
        `${toolbar.getBoundingClientRect().height}px`,
      );
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);

    observer.observe(toolbar);

    return () => {
      observer.disconnect();
      rootStyle.removeProperty("--site-header-height");
    };
  }, [header]);
}
