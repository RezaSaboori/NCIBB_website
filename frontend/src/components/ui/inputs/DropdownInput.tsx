import React, { useState, useRef, useEffect } from "react";
import "../inputs.css";

interface DropdownInputProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  chevronIcon: React.ReactNode;
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
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className={`ui-dropdown ${className}`} ref={ref}>
      <div
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

      <div className={`ui-dropdown__panel${open ? " is-open" : ""}`}>
        <div className="ui-dropdown__list">
          {options.map((opt) => (
            <div
              key={opt}
              className={`ui-dropdown__item${value === opt ? " is-selected" : ""}`}
              role="option"
              aria-selected={value === opt}
              onClick={() => { onChange(opt); setOpen(false); }}
            >
              {opt}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};