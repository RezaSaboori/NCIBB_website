import React from "react";
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
  const shellClass = `ui-input-shell${multiline ? " ui-input-shell--grow" : ""} ${className}`;

  return (
    <div className={shellClass}>
      {multiline ? (
        <textarea
          id={id}
          className="ui-input-field ui-input-field--textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          dir={dir}
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