import React, { useRef, useEffect } from "react";
import "../inputs.css";

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
  dir?: "rtl" | "ltr";
  id?: string;
  multiline?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({
  value,
  onChange,
  placeholder = "Enter value...",
  className = "",
  icon,
  dir,
  id,
  multiline = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize: collapse to 1px to measure scrollHeight, then apply it.
  // CSS max-height + overflow-y:auto on the textarea handles the scroll lock.
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
          id={id}
          className="ui-input-field ui-input-field--textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          dir={dir}
          rows={1}
        />
      ) : (
        <input
          id={id}
          className="ui-input-field"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          dir={dir}
        />
      )}
      {icon}
    </div>
  );
};