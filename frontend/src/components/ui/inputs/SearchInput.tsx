import React, { useRef, useEffect } from "react";
import "../inputs.css";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  icon: React.ReactNode;
  multiline?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  ariaLabel,
  className = "",
  icon,
  multiline = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!multiline || !textareaRef.current) return;
    const el = textareaRef.current;
    el.style.height = "1px";
    el.style.height = `${el.scrollHeight}px`;
  }, [value, multiline]);

  const shellClass = `ui-input-shell${multiline ? " ui-input-shell--grow" : ""} ${className}`.trim();

  return (
    <div className={shellClass}>
      {multiline ? (
        <textarea
          ref={textareaRef}
          className="ui-input-field ui-input-field--textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={ariaLabel}
          autoComplete="off"
          spellCheck={false}
          rows={1}
        />
      ) : (
        <input
          className="ui-input-field"
          type="text"
          inputMode="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={ariaLabel}
          autoComplete="off"
          spellCheck={false}
        />
      )}
      {icon}
    </div>
  );
};
