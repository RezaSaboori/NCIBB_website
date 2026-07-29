import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import "../inputs.css";

interface BaseDropdownProps {
  options: string[];
  placeholder?: string;
  className?: string;
  chevronIcon: React.ReactNode;
  searchable?: boolean;
  dir?: "ltr" | "rtl";
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
    dir,
  } = props;

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) { setSearch(""); return; }
    const handler = (e: MouseEvent) => {
      const inTrigger = ref.current?.contains(e.target as Node);
      const inPanel = panelRef.current?.contains(e.target as Node);
      if (!inTrigger && !inPanel) setOpen(false);
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

  const triggerRef = useRef<HTMLDivElement>(null);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});

  const updatePanelPosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const resolvedDir = dir ?? (getComputedStyle(el).direction as "ltr" | "rtl");
    setPanelStyle({
      position: "fixed",
      top: rect.bottom + 6,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
      direction: resolvedDir,
      textAlign: "start",
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePanelPosition();
    window.addEventListener("scroll", updatePanelPosition, true);
    window.addEventListener("resize", updatePanelPosition);
    return () => {
      window.removeEventListener("scroll", updatePanelPosition, true);
      window.removeEventListener("resize", updatePanelPosition);
    };
  }, [open, updatePanelPosition]);

  const portalRoot =
    typeof document !== "undefined"
      ? document.getElementById("ui-dropdown-portals") ?? document.body
      : null;

  const resolvedDir = (panelStyle.direction as "ltr" | "rtl") ?? "ltr";

  const panel = (
    <div
      ref={panelRef}
      dir={resolvedDir}
      className={`ui-dropdown__panel${open ? " is-open" : ""}`}
      style={panelStyle}
    >
      {searchable && (
        <div className="ui-input-shell ui-dropdown__search-shell">
          <input
            ref={searchRef}
            className="ui-input-field"
            type="text"
            placeholder={panelStyle.direction === "rtl" ? "جست و جو" : "Search..."}
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
            className={`ui-dropdown__item${
              isSelected(opt)
                ? " is-selected blue-glass"
                : hoveredOption === opt
                  ? " glass"
                  : ""
            }`}
            role="option"
            aria-selected={isSelected(opt)}
            onMouseEnter={() => setHoveredOption(opt)}
            onMouseLeave={() => setHoveredOption(null)}
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
  );

  return (
    <div className={`ui-dropdown ${className}`} ref={ref}>
      <div
        ref={triggerRef}
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

      {portalRoot && ReactDOM.createPortal(panel, portalRoot)}
    </div>
  );
};