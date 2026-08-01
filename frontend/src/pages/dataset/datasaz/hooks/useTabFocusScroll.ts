/* useTabFocusScroll.ts
 * Manages tab grow/shrink state with outside-click collapse,
 * and scrolls a windows container to the matching window when a tab is clicked.
 */
import { useCallback, useEffect, useRef } from "react";

interface UseTabFocusScrollOptions {
  /** The currently selected/active tab id */
  selectedId: number | null;
  /** Setter for selectedId */
  setSelectedId: (id: number | null) => void;
  /** The set of currently expanded window ids */
  expandedIds: Set<number>;
  /** Ref to the scrollable .s2-criteria-windows container */
  windowsContainerRef: React.RefObject<HTMLDivElement | null>;
  /** Ref to the tabs row anchor (.s2-criteria-tabs-anchor) — clicks inside won't collapse */
  tabsAnchorRef: React.RefObject<HTMLDivElement | null>;
}

export function useTabFocusScroll({
  selectedId,
  setSelectedId,
  expandedIds,
  windowsContainerRef,
  tabsAnchorRef,
}: UseTabFocusScrollOptions) {
  // Collapse selected tab on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        tabsAnchorRef.current &&
        !tabsAnchorRef.current.contains(e.target as Node)
      ) {
        setSelectedId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [setSelectedId, tabsAnchorRef]);

  // Scroll the window into view when a tab is selected and its window is expanded
  const scrollToWindow = useCallback(
    (id: number) => {
      if (!expandedIds.has(id)) return;
      const container = windowsContainerRef.current;
      if (!container) return;
      // Windows are rendered in reversed order; find the DOM child with data-criteria-id
      const target = container.querySelector<HTMLElement>(
        `[data-criteria-id="${id}"]`
      );
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "nearest" });
    },
    [expandedIds, windowsContainerRef]
  );

  return { scrollToWindow };
}