import type { NavigationItem } from "../types";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

import { MobileMenuToggle } from "./MobileMenuToggle";
import { MobileProfileItem } from "./MobileProfileItem";
import { MobileThemeSwitch } from "./MobileThemeSwitch";
import { NavigationLinks } from "./NavigationLinks";
import "../styles/mobileNavigation.css";

interface MobileNavigationProps {
  items: NavigationItem[];
  pathname: string;
  locationKey: string;
  onProfileSignIn?: () => void;
  onSelect?: (value: string) => void;
}

export function MobileNavigation({
  items,
  pathname,
  locationKey,
  onProfileSignIn,
  onSelect,
}: MobileNavigationProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const disclosure = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    if (panel.current) panel.current.inert = !open;
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [locationKey]);

  useEffect(() => {
    if (!open) return;

    const closeOutside = (event: Event) => {
      if (
        event.target instanceof Node &&
        !disclosure.current?.contains(event.target)
      )
        setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      event.preventDefault();
      setOpen(false);
      trigger.current?.focus({ preventScroll: true });
    };
    const mobile = window.matchMedia("(max-width: 620px)");
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (!event.matches) setOpen(false);
    };

    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("focusin", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    mobile.addEventListener("change", closeOnDesktop);

    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("focusin", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
      mobile.removeEventListener("change", closeOnDesktop);
    };
  }, [open]);

  const dismissMenu = () => {
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  };

  return (
    <div ref={disclosure} className="header-mobile-nav" data-open={open}>
      <MobileMenuToggle
        ref={trigger}
        controls={panelId}
        expanded={open}
        onToggle={() => setOpen((current) => !current)}
      />
      <div className="header-mobile-nav__surface glass-transparent">
        <div className="header-mobile-nav__clip">
          <div
            ref={panel}
            className="header-mobile-nav__panel custom-scrollbar"
            id={panelId}
          >
            <nav aria-label="پیمایش اصلی" className="header-mobile-nav__links">
              <NavigationLinks
                showActivePill
                items={items}
                pathname={pathname}
                onSelect={(value) => {
                  dismissMenu();
                  onSelect?.(value);
                }}
              />
              {onProfileSignIn && (
                <MobileProfileItem
                  pathname={pathname}
                  onSelect={dismissMenu}
                  onSignIn={onProfileSignIn}
                />
              )}
            </nav>
            <div className="header-mobile-nav__utilities">
              <MobileThemeSwitch />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
