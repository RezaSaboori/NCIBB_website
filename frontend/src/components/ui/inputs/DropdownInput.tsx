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
    // Use capture=true so this fires before React's synthetic onClick on the
    // new dropdown trigger. We skip closing if the click originated inside
    // ANY .ui-dropdown element — this prevents the race condition where this
    // instance's handler closes another row's dropdown that was just opened.
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const inSelf =
        ref.current?.contains(target) || panelRef.current?.contains(target);
      if (inSelf) return;
      // If the click is inside any other dropdown trigger/panel, don't close —
      // let that dropdown's own toggle handle its state.
      const inOtherDropdown = (target as Element).closest?.(".ui-dropdown");
      if (inOtherDropdown) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler, true);
    return () => document.removeEventListener("mousedown", handler, true);
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
      // Close first so the menu always dismisses on selection, even if the
      // parent's onChange triggers re-renders, cross-component cascades, or
      // throws. Prevents the "stays open after selecting" symptom seen in
      // ProjectInfoCard, where onChange mutates the dropdown's own `value`
      // and propagates up to a grandparent (goToStep/setActiveProject).
      setOpen(false);
      (props as SingleDropdownProps).onChange(opt);
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
  // Initial panel style MUST carry `position: fixed` so the closed panel is
  // positioned relative to the viewport (not the document) and therefore
  // does NOT contribute to document scroll height. Without this, a freshly
  // mounted (never-opened) dropdown's portal panel sits at its static
  // position at the bottom of <body> and creates dead space below the
  // footer equal to its rendered height. `visibility: hidden` keeps it
  // invisible; `top/left: -9999px` guarantees it never paints anywhere
  // visible until `updatePanelPosition()` supplies real coordinates.
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({
    position: "fixed",
    top: -9999,
    left: -9999,
    visibility: "hidden",
  });

  const HIDDEN_PANEL_STYLE: React.CSSProperties = {
    position: "fixed",
    top: -9999,
    left: -9999,
    visibility: "hidden",
    pointerEvents: "none",
  };

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
      visibility: "visible",
      pointerEvents: "auto",
    });
  }, [dir]);

  useEffect(() => {
    if (!open) {
      // Reset panel to hidden position so it never intercepts pointer events
      // while visually closed. This is the fix for phantom clicks on the panel
      // after it has been opened and positioned at real coordinates once.
      setPanelStyle(HIDDEN_PANEL_STYLE);
      return;
    }
    updatePanelPosition();
    window.addEventListener("scroll", updatePanelPosition, true);
    window.addEventListener("resize", updatePanelPosition);
    return () => {
      window.removeEventListener("scroll", updatePanelPosition, true);
      window.removeEventListener("resize", updatePanelPosition);
    };
  }, [open, updatePanelPosition]);

  // React 18 attaches event listeners to the root container (#root).
  // If the portal target is outside #root, synthetic events (like onClick)
  // on portaled children will not fire. We ensure #ui-dropdown-portals is
  // created inside #root dynamically to fix this without requiring manual
  // index.html changes.
  const portalRoot = React.useMemo(() => {
    if (typeof document === "undefined") return null;
    const reactRoot = document.getElementById("root");
    if (!reactRoot) return document.body;
    let root = document.getElementById("ui-dropdown-portals");
    if (!root) {
      root = document.createElement("div");
      root.id = "ui-dropdown-portals";
      reactRoot.appendChild(root);
    } else if (root.parentElement !== reactRoot) {
      reactRoot.appendChild(root);
    }
    return root;
  }, []);

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