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
}

export function useTabFocusScroll({
  selectedId,
  setSelectedId,
  expandedIds,
  windowsContainerRef,
  tabsAnchorRef,
}: UseTabFocusScrollOptions) {
  // Keep a live ref to expandedIds so scrollToWindow never reads a stale closure
  const expandedIdsRef = useRef(expandedIds);
  useEffect(() => {
    expandedIdsRef.current = expandedIds;
  });

  // Collapse selected tab on outside click.
  // Guard: if the click target is inside a spotlight overlay (.s2-spotlight)
  // — i.e. the user just selected a suggestion — do NOT collapse.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (tabsAnchorRef.current?.contains(target)) return;
      // Spotlight suggestions sit outside tabsAnchorRef; selecting one must
      // not collapse the freshly-set selectedId.
      const spotlight = document.querySelector(".s2-spotlight");
      if (spotlight?.contains(target)) return;
      setSelectedId(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [setSelectedId, tabsAnchorRef]);

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

  return { scrollToWindow };
}