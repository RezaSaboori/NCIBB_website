import React, { useRef } from "react";
import { useAutosizeTextarea } from "./useAutosizeTextarea";
import "../inputs.css";

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
  dir?: "rtl" | "ltr";
  id?: string;
  ariaLabel?: string;
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
  ariaLabel,
  multiline = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useAutosizeTextarea(textareaRef, value, multiline);

  const shellClass = `ui-input-shell${multiline ? " ui-input-shell--grow" : ""} ${className}`.trim();

  return (
    <div className={shellClass}>
      {multiline ? (
        <textarea
          ref={textareaRef}
          id={id}
          aria-label={ariaLabel}
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
          aria-label={ariaLabel}
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
