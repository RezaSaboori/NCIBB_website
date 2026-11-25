import { useLayoutEffect, useRef } from "react";

function revealItem(rail: HTMLElement, item: HTMLElement) {
  const overflow = rail.scrollWidth - rail.clientWidth;

  if (overflow <= 1) return;

  const offset = -rail.scrollLeft;
  const railBounds = rail.getBoundingClientRect();
  const itemBounds = item.getBoundingClientRect();
  const inset =
    parseFloat(getComputedStyle(rail).scrollPaddingInlineStart) || 0;
  const left = itemBounds.left - railBounds.left - inset;
  const right = itemBounds.right - railBounds.right + inset;

  if (left < 0 && offset < overflow - 1) rail.scrollBy({ left });
  if (right > 0 && offset > 1) rail.scrollBy({ left: right });
}

export function useProfileRail(activeTab: string, itemCount: number) {
  const navigation = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const rail = navigation.current;

    if (!rail) return;

    const updateEdges = () => {
      const offset = Math.max(0, -rail.scrollLeft);
      const overflow = rail.scrollWidth - rail.clientWidth;

      rail.toggleAttribute("data-overflow-left", overflow - offset > 1);
      rail.toggleAttribute("data-overflow-right", overflow > 1 && offset > 1);
    };

    const selectedItem = () =>
      rail.querySelector<HTMLElement>("[aria-current='page']");
    const resize = () => {
      const item = rail.querySelector<HTMLElement>(":focus") ?? selectedItem();

      if (item) revealItem(rail, item);
      updateEdges();
    };

    const selected = selectedItem();

    if (selected) revealItem(rail, selected);
    updateEdges();
    rail.addEventListener("scroll", updateEdges, { passive: true });
    const observer = new ResizeObserver(resize);

    observer.observe(rail);
    for (const item of rail.querySelectorAll(".sidebar-nav__item"))
      observer.observe(item);

    return () => {
      rail.removeEventListener("scroll", updateEdges);
      observer.disconnect();
    };
  }, [activeTab, itemCount]);

  return { navigation, revealItem };
}
