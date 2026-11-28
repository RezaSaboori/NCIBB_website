import { cloneElement, forwardRef, useCallback, useEffect, useId, useRef, useState, type AriaAttributes, type KeyboardEvent, type ReactElement } from "react"
import { createPortal } from "react-dom"
import { SearchInput } from "./SearchInput"
import { useDropdownPosition } from "./useDropdownPosition"
import "../inputs.css"

export interface DropdownOption {
  value: string
  label: string
  disabled?: boolean
}

export interface RemoteDropdownSearch {
  label: string
  value: string
  onChange: (value: string) => void
  loading: boolean
  error?: string
  retry?: () => void
}

interface BaseDropdownProps extends Pick<AriaAttributes, "aria-label" | "aria-describedby" | "aria-invalid"> {
  options: readonly (string | DropdownOption)[]
  placeholder?: string
  className?: string
  chevronIcon?: ReactElement<{ className?: string }>
  searchable?: boolean
  remoteSearch?: RemoteDropdownSearch
  selectedLabel?: string
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
    const { className = "", chevronIcon, disabled, dir, required, remoteSearch } = props
    const searchable = Boolean(remoteSearch) || (props.searchable ?? (props.options.length > searchThreshold))
    const options = props.options.map((option) => typeof option === "string" ? { value: option, label: option } : option)
    const triggerRef = useRef<HTMLButtonElement | null>(null)
    const panelRef = useRef<HTMLDivElement>(null)
    const searchRef = useRef<HTMLInputElement>(null)
    const listRef = useRef<HTMLDivElement>(null)
    const retryRef = useRef<HTMLButtonElement>(null)
    const [portalContainer, setPortalContainer] = useState<Element | null>(null)
    const [search, setSearch] = useState("")
    const [activeValue, setActiveValue] = useState<string>()
    const [rtl, setRtl] = useState(dir === "rtl")
    const id = useId()
    const triggerId = props.id ?? id
    const listId = `${id}-options`
    const open = Boolean(portalContainer)
    const selectedValues = props.multiple ? props.value : [props.value]
    const displayText = props.selectedLabel ?? selectedValues.map((value) => options.find((option) => option.value === value)?.label ?? value).join(", ")
    const placeholder = props.placeholder ?? (dir === "rtl" ? "انتخاب کنید" : "Select value...")
    const searchTerm = search.trim().toLocaleLowerCase()
    const filtered = searchable && searchTerm && !remoteSearch
      ? options.filter(({ label }) => label.toLocaleLowerCase().includes(searchTerm))
      : options
    const focusedIndex = filtered.findIndex((option) => option.value === activeValue && !option.disabled)
    const activeIndex = remoteSearch && focusedIndex < 0
      ? filtered.findIndex((option) => !option.disabled) : focusedIndex
    const activeId = activeIndex < 0 ? undefined : `${listId}-${activeIndex}`
    const chevronClass = `ui-chevron-icon${open ? " ui-chevron-icon--open" : ""}`
    const setTriggerRef = useCallback((button: HTMLButtonElement | null) => {
      triggerRef.current = button
      if (typeof ref === "function") ref(button)
      else if (ref) ref.current = button
    }, [ref])

    useDropdownPosition(triggerRef, panelRef, portalContainer, filtered.length, remoteSearch?.error)

    useEffect(() => {
      if (!open) return
      const focusTarget = searchRef.current ?? listRef.current
      focusTarget?.focus({ preventScroll: true })

      const isTriggerTarget = (target: Node) => {
        const trigger = triggerRef.current
        return trigger?.contains(target) ||
          Array.from(trigger?.labels ?? []).some((label) => label.contains(target))
      }
      const dismissOutside = (event: PointerEvent) => {
        const { target } = event
        if (!(target instanceof Node) || isTriggerTarget(target) || panelRef.current?.contains(target)) return
        setPortalContainer(null)
      }
      const preserveFocusUntilClick = (event: MouseEvent) => {
        // A label can move focus out of the menu before forwarding its click.
        if (event.button === 0 && event.target instanceof Node && isTriggerTarget(event.target)) {
          event.preventDefault()
        }
      }
      document.addEventListener("pointerdown", dismissOutside, true)
      document.addEventListener("mousedown", preserveFocusUntilClick, true)
      return () => {
        document.removeEventListener("pointerdown", dismissOutside, true)
        document.removeEventListener("mousedown", preserveFocusUntilClick, true)
      }
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
      if (remoteSearch?.value) remoteSearch.onChange("")
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
        if (retryRef.current && !event.shiftKey && event.target !== retryRef.current) {
          event.preventDefault()
          event.stopPropagation()
          retryRef.current.focus()
          return
        }
        if (event.shiftKey && event.target === retryRef.current && searchRef.current) {
          event.preventDefault()
          event.stopPropagation()
          searchRef.current.focus()
          return
        }
        close(true)
        return
      }
      if (event.key === "Escape") {
        event.preventDefault()
        event.stopPropagation()
        close(true)
        return
      }
      if (event.target === retryRef.current) return
      if (event.key === "Enter" || (event.key === " " && event.target === listRef.current)) {
        event.preventDefault()
        if (activeIndex >= 0) select(filtered[activeIndex])
        return
      }
      const searchableField = event.target === searchRef.current
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp" && (searchableField || !["Home", "End"].includes(event.key))) return
      event.preventDefault()
      const available = filtered.filter((option) => !option.disabled)
      const current = available.findIndex((option) => option.value === filtered[activeIndex]?.value)
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

    const searchLabel = remoteSearch?.label ?? (rtl ? "جست و جو" : "Search")

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
          data-invalid={props["aria-invalid"]}
          disabled={disabled}
          onClick={() => open ? close(true) : show()}
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
          <div className="ui-dropdown__panel" dir={rtl ? "rtl" : "ltr"} ref={panelRef}>
            {searchable && (
              <SearchInput className="ui-dropdown__search-shell" placeholder={searchLabel} ariaLabel={searchLabel}
                value={remoteSearch?.value ?? search} inputProps={{
                  ref: searchRef, role: "combobox", "aria-expanded": true, "aria-invalid": props["aria-invalid"],
                  "aria-controls": listId, "aria-activedescendant": activeId, "aria-autocomplete": "list", onKeyDown: handlePanelKey,
                }} onChange={(value) => {
                  if (remoteSearch) {
                    remoteSearch.onChange(value)
                    setActiveValue(undefined)
                  } else {
                    const term = value.trim().toLocaleLowerCase()
                    setSearch(value)
                    setActiveValue(options.find((option) => !option.disabled && option.label.toLocaleLowerCase().includes(term))?.value)
                  }
                  if (listRef.current) listRef.current.scrollTop = 0
                }} />
            )}
            <div className="ui-dropdown__list custom-scrollbar" id={listId} ref={listRef} role="listbox" aria-labelledby={triggerId}
              tabIndex={searchable ? -1 : 0} aria-required={required} aria-multiselectable={props.multiple || undefined}
              aria-activedescendant={searchable ? undefined : activeId} aria-busy={remoteSearch?.loading || undefined}
              aria-invalid={searchable ? undefined : props["aria-invalid"]} onKeyDown={handlePanelKey}>
              {filtered.map((option, index) => {
                const selected = selectedValues.includes(option.value)
                const style = selected ? " is-selected blue-glass" : index === activeIndex ? " glass" : ""
                return (
                  <div key={option.value} id={`${listId}-${index}`} role="option" aria-selected={selected} aria-disabled={option.disabled} data-active={index === activeIndex || undefined}
                    className={`ui-dropdown__item${style}`} onMouseEnter={() => !option.disabled && setActiveValue(option.value)}
                    onMouseDown={(event) => event.preventDefault()} onClick={() => select(option)}>
                    {props.multiple && <span className="ui-dropdown__check" aria-hidden="true">{selected ? "✓" : ""}</span>}
                    {option.label}
                  </div>
                )
              })}
            </div>
            {remoteSearch?.loading ? (
              <p role="status" className="ui-dropdown__item ui-dropdown__item--empty">{rtl ? "در حال بارگذاری…" : "Loading…"}</p>
            ) : remoteSearch?.error ? (
              <div className="ui-dropdown__status">
                <p role="alert" className="ui-dropdown__item ui-dropdown__item--empty">{remoteSearch.error}</p>
                {remoteSearch.retry && (
                  <button ref={retryRef} type="button" className="glass ui-glass-button" onKeyDown={handlePanelKey} onClick={() => {
                    searchRef.current?.focus({ preventScroll: true })
                    remoteSearch.retry?.()
                  }}>{rtl ? "تلاش دوباره" : "Retry"}</button>
                )}
              </div>
            ) : filtered.length === 0 && (
              <p role="status" className="ui-dropdown__item ui-dropdown__item--empty">{rtl ? "نتیجه‌ای یافت نشد." : "No results found."}</p>
            )}
          </div>,
          portalContainer,
        )}
      </div>
    )
  },
)
