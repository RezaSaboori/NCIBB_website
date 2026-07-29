import React, { useState, useRef, useEffect } from "react";
import "../inputs.css";

interface BaseDropdownProps {
  options: string[];
  placeholder?: string;
  className?: string;
  chevronIcon: React.ReactNode;
  searchable?: boolean;
}

interface SingleDropdownProps extends BaseDropdownProps {
  multiple?: false;
  value: string;
  onChange: (value: string) => void;
}

interface MultiDropdownProps extends BaseDropdownProps {
  multiple: true;
  value: string[];
  onChange: (value: string[]) => void;
}

type DropdownInputProps = SingleDropdownProps | MultiDropdownProps;

export const DropdownInput: React.FC<DropdownInputProps> = (props) => {
  const {
    options,
    placeholder = "Select value...",
    className = "",
    chevronIcon,
    searchable = false,
    multiple = false,
  } = props;

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) { setSearch(""); return; }
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (open && searchable) searchRef.current?.focus();
  }, [open, searchable]);

  const isSelected = (opt: string) =>
    multiple
      ? (props.value as string[]).includes(opt)
      : props.value === opt;

  const handleSelect = (opt: string) => {
    if (multiple) {
      const current = props.value as string[];
      const next = current.includes(opt)
        ? current.filter((v) => v !== opt)
        : [...current, opt];
      (props as MultiDropdownProps).onChange(next);
    } else {
      (props as SingleDropdownProps).onChange(opt);
      setOpen(false);
    }
  };

  const filteredOptions = searchable && search.trim()
    ? options.filter((o) => o.toLowerCase().includes(search.toLowerCase()))
    : options;

  const displayText = multiple
    ? (props.value as string[]).length > 0
      ? (props.value as string[]).join(", ")
      : ""
    : (props.value as string);

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
        <span className={`ui-dropdown__text${!displayText ? " ui-dropdown__text--placeholder" : ""}`}>
          {displayText || placeholder}
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
        {searchable && (
          <div className="ui-input-shell ui-dropdown__search-shell">
            <input
              ref={searchRef}
              className="ui-input-field"
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
        <div className="ui-dropdown__list">
          {filteredOptions.map((opt) => (
            <div
              key={opt}
              className={`ui-dropdown__item${isSelected(opt) ? " is-selected blue-glass" : " glass"}`}
              role="option"
              aria-selected={isSelected(opt)}
              onClick={() => handleSelect(opt)}
            >
              {multiple && (
                <span className="ui-dropdown__check">
                  {isSelected(opt) ? "✓" : ""}
                </span>
              )}
              {opt}
            </div>
          ))}
          {filteredOptions.length === 0 && (
            <div className="ui-dropdown__item ui-dropdown__item--empty">No results</div>
          )}
        </div>
      </div>
    </div>
  );
};