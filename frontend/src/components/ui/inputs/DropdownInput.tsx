import { cloneElement, forwardRef, useCallback, useEffect, useId, useRef, useState, type AriaAttributes, type KeyboardEvent, type ReactElement } from "react"
import { createPortal } from "react-dom"
import { useDropdownPosition } from "./useDropdownPosition"
import "../inputs.css"

export interface DropdownOption {
  value: string
  label: string
  disabled?: boolean
}

interface BaseDropdownProps extends Pick<AriaAttributes, "aria-label" | "aria-describedby" | "aria-invalid"> {
  options: readonly (string | DropdownOption)[]
  placeholder?: string
  className?: string
  chevronIcon?: ReactElement<{ className?: string }>
  searchable?: boolean
  dir?: "ltr" | "rtl"
  id?: string
  disabled?: boolean
  required?: boolean
  onBlur?: () => void
}

interface SingleDropdownProps extends BaseDropdownProps {
  multiple?: false
  value: string
  onChange: (value: string) => void
}

interface MultiDropdownProps extends BaseDropdownProps {
  multiple: true
  value: string[]
  onChange: (value: string[]) => void
}

const searchThreshold = 6

export const DropdownInput = forwardRef<HTMLButtonElement, SingleDropdownProps | MultiDropdownProps>(
  function DropdownInput(props, ref) {
    const { className = "", chevronIcon, disabled, dir, required } = props
    const searchable = props.searchable ?? (props.options.length > searchThreshold)
    const options = props.options.map((option) => typeof option === "string" ? { value: option, label: option } : option)
    const triggerRef = useRef<HTMLButtonElement | null>(null)
    const panelRef = useRef<HTMLDivElement>(null)
    const searchRef = useRef<HTMLInputElement>(null)
    const listRef = useRef<HTMLDivElement>(null)
    const [portalContainer, setPortalContainer] = useState<Element | null>(null)
    const [search, setSearch] = useState("")
    const [activeValue, setActiveValue] = useState<string>()
    const [rtl, setRtl] = useState(dir === "rtl")
    const id = useId()
    const triggerId = props.id ?? id
    const listId = `${id}-options`
    const open = Boolean(portalContainer)
    const selectedValues = props.multiple ? props.value : [props.value]
    const displayText = selectedValues.map((value) => options.find((option) => option.value === value)?.label ?? value).join(", ")
    const placeholder = props.placeholder ?? (dir === "rtl" ? "انتخاب کنید" : "Select value...")
    const searchTerm = search.trim().toLocaleLowerCase()
    const filtered = searchable && searchTerm
      ? options.filter(({ label }) => label.toLocaleLowerCase().includes(searchTerm))
      : options
    const activeIndex = filtered.findIndex((option) => option.value === activeValue && !option.disabled)
    const activeId = activeIndex < 0 ? undefined : `${listId}-${activeIndex}`
    const chevronClass = `ui-chevron-icon${open ? " ui-chevron-icon--open" : ""}`
    const setTriggerRef = useCallback((button: HTMLButtonElement | null) => {
      triggerRef.current = button
      if (typeof ref === "function") ref(button)
      else if (ref) ref.current = button
    }, [ref])

    useDropdownPosition(triggerRef, panelRef, portalContainer)

    useEffect(() => {
      if (!open) return
      const focusTarget = searchRef.current ?? listRef.current
      focusTarget?.focus({ preventScroll: true })

      const dismissOutside = (event: PointerEvent) => {
        const target = event.target as Node
        if (!triggerRef.current?.contains(target) && !panelRef.current?.contains(target)) setPortalContainer(null)
      }
      document.addEventListener("pointerdown", dismissOutside, true)
      return () => document.removeEventListener("pointerdown", dismissOutside, true)
    }, [open, searchable])

    const close = (restoreFocus = false) => {
      if (restoreFocus) triggerRef.current?.focus({ preventScroll: true })
      setPortalContainer(null)
    }

    const show = (last = false) => {
      const trigger = triggerRef.current
      if (!trigger || disabled) return
      const available = options.filter((option) => !option.disabled)
      setSearch("")
      setActiveValue((available.find((option) => selectedValues.includes(option.value)) ?? available.at(last ? -1 : 0))?.value)
      setRtl(getComputedStyle(trigger).direction === "rtl")
      setPortalContainer(trigger.closest('[role="dialog"]') ?? document.body)
    }

    const select = (option: DropdownOption) => {
      if (option.disabled) return
      if (props.multiple) {
        props.onChange(selectedValues.includes(option.value)
          ? selectedValues.filter((value) => value !== option.value)
          : [...selectedValues, option.value])
      } else {
        close(true)
        props.onChange(option.value)
      }
    }

    const handlePanelKey = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        close(true)
        return
      }
      if (event.key === "Escape") {
        event.preventDefault()
        event.stopPropagation()
        close(true)
        return
      }
      if (event.key === "Enter" || (event.key === " " && event.target === listRef.current)) {
        event.preventDefault()
        if (activeIndex >= 0) select(filtered[activeIndex])
        return
      }
      const searchableField = event.target === searchRef.current
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp" && (searchableField || !["Home", "End"].includes(event.key))) return
      event.preventDefault()
      const available = filtered.filter((option) => !option.disabled)
      const current = available.findIndex((option) => option.value === activeValue)
      let nextIndex = 0
      if (event.key === "ArrowDown") nextIndex = Math.min(current + 1, available.length - 1)
      if (event.key === "ArrowUp") nextIndex = current < 0 ? available.length - 1 : Math.max(current - 1, 0)
      if (event.key === "End") nextIndex = available.length - 1
      const next = available[nextIndex]
      if (!next) return
      setActiveValue(next.value)
      const list = listRef.current
      const element = list?.children[filtered.indexOf(next)] as HTMLElement | undefined
      if (list && element) {
        const top = element.offsetTop
        const bottom = top + element.offsetHeight
        if (top < list.scrollTop) list.scrollTop = top
        else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight
      }
    }

    const searchLabel = rtl ? "جست و جو" : "Search"

    return (
      <div className={`ui-dropdown ${className}`} dir={dir} onBlur={(event) => {
        if (triggerRef.current?.contains(event.relatedTarget) || panelRef.current?.contains(event.relatedTarget)) return
        close()
        props.onBlur?.()
      }}>
        <button
          ref={setTriggerRef}
          id={triggerId}
          type="button"
          className="ui-input-shell ui-dropdown__trigger"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-label={props["aria-label"]}
          aria-describedby={props["aria-describedby"]}
          aria-invalid={props["aria-invalid"]}
          disabled={disabled}
          onClick={() => open ? close() : show()}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault()
              show(event.key === "ArrowUp")
            }
          }}
        >
          <span className={`ui-dropdown__text${displayText ? "" : " ui-dropdown__text--placeholder"}`}>{displayText || placeholder}</span>
          <span className="glass ui-dropdown__chevron" aria-hidden="true">
            {chevronIcon ? cloneElement(chevronIcon, { className: chevronClass }) : (
              <svg className={chevronClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            )}
          </span>
        </button>
        {portalContainer && createPortal(
          <div className="ui-dropdown__panel" dir={rtl ? "rtl" : "ltr"} ref={panelRef} onKeyDown={handlePanelKey}>
            {searchable && (
              <div className="ui-input-shell ui-dropdown__search-shell">
                <input
                  ref={searchRef}
                  className="ui-input-field"
                  type="text"
                  role="combobox"
                  aria-expanded="true"
                  aria-label={searchLabel}
                  aria-controls={listId}
                  aria-activedescendant={activeId}
                  aria-autocomplete="list"
                  placeholder={searchLabel}
                  value={search}
                  onChange={(event) => {
                    const value = event.target.value
                    const term = value.trim().toLocaleLowerCase()
                    setSearch(value)
                    setActiveValue(options.find((option) => !option.disabled && option.label.toLocaleLowerCase().includes(term))?.value)
                    if (listRef.current) listRef.current.scrollTop = 0
                  }}
                />
              </div>
            )}
            <div className="ui-dropdown__list" id={listId} ref={listRef} role="listbox" aria-labelledby={triggerId}
              tabIndex={searchable ? -1 : 0} aria-required={required} aria-multiselectable={props.multiple || undefined}
              aria-activedescendant={searchable ? undefined : activeId}>
              {filtered.map((option, index) => {
                const selected = selectedValues.includes(option.value)
                const style = selected ? " is-selected blue-glass" : index === activeIndex ? " glass" : ""
                return (
                  <div key={option.value} id={`${listId}-${index}`} role="option" aria-selected={selected} aria-disabled={option.disabled}
                    className={`ui-dropdown__item${style}`} onMouseEnter={() => !option.disabled && setActiveValue(option.value)}
                    onMouseDown={(event) => event.preventDefault()} onClick={() => select(option)}>
                    {props.multiple && <span className="ui-dropdown__check" aria-hidden="true">{selected ? "✓" : ""}</span>}
                    {option.label}
                  </div>
                )
              })}
            </div>
            {filtered.length === 0 && <p role="status" className="ui-dropdown__item ui-dropdown__item--empty">{rtl ? "نتیجه‌ای یافت نشد." : "No results found."}</p>}
          </div>,
          portalContainer,
        )}
      </div>
    )
  },
)
