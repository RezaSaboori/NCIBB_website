import { forwardRef } from "react";

interface MobileMenuToggleProps {
  controls: string;
  expanded: boolean;
  onToggle: () => void;
}

export const MobileMenuToggle = forwardRef<
  HTMLButtonElement,
  MobileMenuToggleProps
>(function MobileMenuToggle({ controls, expanded, onToggle }, ref) {
  return (
    <button
      ref={ref}
      aria-controls={controls}
      aria-expanded={expanded}
      aria-label={expanded ? "بستن منو" : "باز کردن منو"}
      className="header-nav__control header-mobile-nav__toggle"
      type="button"
      onClick={onToggle}
    >
      <svg
        aria-hidden="true"
        className="header-mobile-nav__glyph"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M5 12h14" />
        <path d="M5 12h14" />
        <path d="M5 12h14" />
      </svg>
    </button>
  );
});
