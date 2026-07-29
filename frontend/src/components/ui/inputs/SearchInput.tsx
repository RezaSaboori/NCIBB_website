import React from "react";
import "../inputs.css";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  icon: React.ReactNode;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Search...",
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
        autoComplete="off"
        spellCheck={false}
      />
      {icon}
    </div>
  );
};