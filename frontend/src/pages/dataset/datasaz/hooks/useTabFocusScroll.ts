/* useTabFocusScroll.ts
 * Manages tab grow/shrink state with outside-click collapse,
 * and scrolls a windows container to the matching window when a tab is clicked.
 */
import { useCallback, useEffect, useRef } from "react";

interface UseTabFocusScrollOptions {
  selectedId: number | null;
  setSelectedId: (id: number | null) => void;
  expandedIds: Set<number>;
  windowsContainerRef: React.RefObject<HTMLDivElement | null>;
  tabsAnchorRef: React.RefObject<HTMLDivElement | null>;
  spotlightOpenRef?: React.RefObject<boolean>;
}

export function useTabFocusScroll({
  selectedId,
  setSelectedId,
  expandedIds,
  windowsContainerRef,
  tabsAnchorRef,
  spotlightOpenRef,
}: UseTabFocusScrollOptions) {
  // Keep a live ref to expandedIds so scrollToWindow never reads a stale closure
  const expandedIdsRef = useRef(expandedIds);
  useEffect(() => {
    expandedIdsRef.current = expandedIds;
  });

  // Collapse selected tab on outside click.
  // Guard: if the click target is inside a spotlight overlay (.s2-spotlight)
  // — i.e. the user just selected a suggestion — do NOT collapse.
  // Suppress outside-click collapse for one tick after spotlight closes
  const suppressNextCollapseRef = useRef(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suppressNextCollapseRef.current) {
        suppressNextCollapseRef.current = false;
        return;
      }
      const target = e.target as Node;
      if (tabsAnchorRef.current?.contains(target)) return;
      // If spotlight is currently open, any click inside it must not collapse.
      if (spotlightOpenRef?.current) return;
      setSelectedId(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [setSelectedId, tabsAnchorRef, spotlightOpenRef]);

  const scrollToWindow = useCallback(
    (id: number) => {
      // Use the live ref so we always see the latest expandedIds
      if (!expandedIdsRef.current.has(id)) return;
      const container = windowsContainerRef.current;
      if (!container) return;
      const target = container.querySelector<HTMLElement>(
        `[data-criteria-id="${id}"]`
      );
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "nearest" });
    },
    [windowsContainerRef]
  );

  return { scrollToWindow, suppressNextCollapseRef };
}