import {
  useRef,
  type ComponentPropsWithRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
  type RefObject,
} from "react";

import { SearchIcon } from "../../icons";
import { useAutosizeTextarea } from "./useAutosizeTextarea";
import "../inputs.css";

interface SearchInputBase {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  icon?: ReactNode;
  shellRef?: RefObject<HTMLSpanElement>;
}

type SearchInputProps = SearchInputBase &
  (
    | {
        multiline?: false;
        inputProps?: Omit<
          ComponentPropsWithRef<"input">,
          "value" | "onChange" | "placeholder" | "className"
        >;
      }
    | {
        multiline: true;
        textareaProps?: Omit<
          ComponentPropsWithoutRef<"textarea">,
          "value" | "onChange" | "placeholder" | "className"
        > & {
          enterKeyHint?: HTMLTextAreaElement["enterKeyHint"];
        };
        textareaRef?: RefObject<HTMLTextAreaElement>;
      }
  );

export function SearchInput(props: SearchInputProps) {
  const {
    value,
    onChange,
    placeholder,
    ariaLabel,
    className = "",
    icon,
    shellRef,
  } = props;
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = (props.multiline && props.textareaRef) || internalRef;

  useAutosizeTextarea(textareaRef, value, Boolean(props.multiline));

  const shellClass =
    `ui-input-shell ui-input-shell--with-action ui-search-input${props.multiline ? " ui-input-shell--grow" : ""} ${className}`.trim();
  const fieldProps = {
    value,
    placeholder,
    "aria-label": ariaLabel,
    autoComplete: "off",
    spellCheck: false,
  };

  return (
    <span ref={shellRef} className={shellClass}>
      {props.multiline ? (
        <textarea
          {...fieldProps}
          {...props.textareaProps}
          ref={textareaRef}
          className="ui-input-field ui-input-field--textarea custom-scrollbar"
          rows={1}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          inputMode="search"
          type="text"
          {...fieldProps}
          {...props.inputProps}
          className="ui-input-field"
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      <span className="ui-input-action-slot ui-search-input__icon">
        {icon ?? (
          <span aria-hidden="true" className="glass ui-search-input__glyph">
            <SearchIcon />
          </span>
        )}
      </span>
    </span>
  );
}
