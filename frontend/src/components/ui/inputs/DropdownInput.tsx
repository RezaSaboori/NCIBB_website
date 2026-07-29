import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import "../inputs.css";

interface DropdownInputProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  chevronIcon: React.ReactNode;
}

// Lazily create a single portal container appended to <body>
function getPortalRoot(): HTMLElement {
  let el = document.getElementById("ui-dropdown-portals");
  if (!el) {
    el = document.createElement("div");
    el.id = "ui-dropdown-portals";
    document.body.appendChild(el);
  }
  return el;
}

export const DropdownInput: React.FC<DropdownInputProps> = ({
  value,
  options,
  onChange,
  placeholder = "Select value...",
  className = "",
  chevronIcon,
}) => {
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
  const shellRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Compute panel position from the shell's bounding rect
  const updatePosition = useCallback(() => {
    if (!shellRef.current) return;
    const rect = shellRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const panelHeight = 228; // max-height of panel (220px) + 8px gap

    // Open upward if not enough room below
    const openUpward = spaceBelow < panelHeight && spaceAbove > spaceBelow;

    setPanelStyle({
      position: "fixed",
      left: rect.left,
      width: rect.width,
      ...(openUpward
        ? { bottom: window.innerHeight - rect.top + 6 }
        : { top: rect.bottom + 6 }),
      zIndex: 9999,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        shellRef.current?.contains(e.target as Node) ||
        panelRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const panel = (
    <div
      ref={panelRef}
      className={`ui-dropdown__panel ui-dropdown__panel--portal${open ? " is-open" : ""}`}
      style={panelStyle}
    >
      <div className="ui-dropdown__list">
        {options.map((opt) => (
          <div
            key={opt}
            className={`ui-dropdown__item${value === opt ? " is-selected" : ""}`}
            role="option"
            aria-selected={value === opt}
            onMouseDown={(e) => {
              // mousedown instead of click so it fires before the blur/outside handler
              e.preventDefault();
              onChange(opt);
              setOpen(false);
            }}
          >
            {opt}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`ui-dropdown ${className}`}>
      <div
        ref={shellRef}
        className={`ui-input-shell${open ? " ui-input-shell--open" : ""}`}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setOpen((o) => !o);
          if (e.key === "Escape") setOpen(false);
        }}
        style={{ cursor: "pointer" }}
      >
        <span className={`ui-dropdown__text${!value ? " ui-dropdown__text--placeholder" : ""}`}>
          {value || placeholder}
        </span>
        <button
          className="glass dz-icon-btn"
          type="button"
          tabIndex={-1}
          aria-hidden="true"
        >
          {React.cloneElement(chevronIcon as React.ReactElement, {
            className: `dz-icon-btn__icon ui-chevron-icon${open ? " ui-chevron-icon--open" : ""}`,
          })}
        </button>
      </div>

      {ReactDOM.createPortal(panel, getPortalRoot())}
    </div>
  );
};