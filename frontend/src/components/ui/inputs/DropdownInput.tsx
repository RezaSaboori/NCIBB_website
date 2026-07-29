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

function getPortalRoot(): HTMLElement {
  let el = document.getElementById("ui-dropdown-portals");
  if (!el) {
    el = document.createElement("div");
    el.id = "ui-dropdown-portals";
    // Must NOT have position:relative/absolute — stays as static block on body
    // so that absolute children are positioned relative to the document origin.
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

  const updatePosition = useCallback(() => {
    if (!shellRef.current) return;
    const rect = shellRef.current.getBoundingClientRect();

    // Convert viewport rect → document (absolute) coordinates.
    // This is immune to any ancestor transform/filter/backdrop-filter
    // because <body>'s portal container has no positioning context.
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    const absLeft = rect.left + scrollX;
    const absTop = rect.bottom + scrollY + 6;   // 6px gap below shell
    const absBottom = window.innerHeight - rect.top + scrollY - 6; // for upward

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const panelHeight = 228;
    const openUpward = spaceBelow < panelHeight && spaceAbove > spaceBelow;

    setPanelStyle({
      position: "absolute",
      left: absLeft,
      width: rect.width,
      ...(openUpward
        ? { bottom: absBottom }  // not reliable with absolute; use top instead:
        : { top: absTop }),
      // For upward: calculate top from document top
      ...(openUpward && {
        top: rect.top + scrollY - panelHeight - 6,
        bottom: "auto",
      }),
      zIndex: 9999,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    // Capture:true catches scroll on any ancestor, not just window
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

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