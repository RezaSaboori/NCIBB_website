import React from "react";
import "../inputs.css";

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
}

export const TextInput: React.FC<TextInputProps> = ({
  value,
  onChange,
  placeholder = "Enter value...",
  className = "",
  icon,
}) => {
  return (
    <div className={`ui-input-shell ${className}`}>
      <input
        className="ui-input-field"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {icon}
    </div>
  );
};