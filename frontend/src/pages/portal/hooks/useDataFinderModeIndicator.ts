import { useLayoutEffect, type RefObject } from "react";

export const useDataFinderModeIndicator = (
  containerRef: RefObject<HTMLDivElement>,
  activeModeId: string,
) => {
  useLayoutEffect(() => {
    const container = containerRef.current;
    const activeItem = container?.querySelector<HTMLElement>(
      `#${activeModeId}`,
    );

    if (!container || !activeItem) return;

    const updateActiveIndicator = () => {
      container.style.setProperty(
        "--active-indicator-width",
        `${activeItem.offsetWidth}px`,
      );
      container.style.setProperty(
        "--active-indicator-left",
        `${activeItem.offsetLeft}px`,
      );
      container.style.setProperty("--active-indicator-opacity", "1");
    };

    updateActiveIndicator();

    // A font swap can move the selected tab even when only its neighbor resizes.
    const observer = new ResizeObserver(updateActiveIndicator);

    observer.observe(container);
    for (const tab of container.children) observer.observe(tab);

    return () => observer.disconnect();
  }, [activeModeId, containerRef]);
};
