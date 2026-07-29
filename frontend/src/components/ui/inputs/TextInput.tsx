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
}

export const TextInput: React.FC<TextInputProps> = ({
  value,
  onChange,
  placeholder = "Enter value...",
  className = "",
  icon,
  dir,
  id,
}) => {
  return (
    <div className={`ui-input-shell ${className}`}>
      <input
        id={id}
        className="ui-input-field"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        dir={dir}
      />
      {icon}
    </div>
  );
};