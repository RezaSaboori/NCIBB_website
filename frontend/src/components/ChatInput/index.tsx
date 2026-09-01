import { useState, useRef, useEffect, useMemo } from "react"
import { AnimatePresence, motion } from "framer-motion"
import clsx from "clsx"

// Utils
import { isUnsupportedBrowser } from "./utils/isUnsupportedBrowser"

// Components
import { GooeyFilter } from "./GooeyFilter"
import { SearchIcon } from "./icons/SearchIcon"
import { LoadingIcon } from "./icons/LoadingIcon"

// Animations
import {
  buttonVariants,
  iconVariants,
  getResultItemVariants,
  getResultItemTransition,
} from "./animations"

import "./styles.css"

interface ChatInputProps {
  className?: string
  buttonText?: string
  placeholderText?: string
  onSubmit?: (query: string) => Promise<void>
  onStepChange?: (step: number) => void
  statusText?: string
}

export const ChatInput = ({
  className,
  buttonText = "درخواست خود را وارد کنید",
  placeholderText = "داده ای که میخواهید جستجو کنید را وارد کنید",
  onSubmit,
  onStepChange,
  statusText,
}: ChatInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const statusRef = useRef<HTMLSpanElement>(null)

  const [state, setState] = useState({
    step: 1, // 1: Initial, 2: Search
    searchText: "",
    isLoading: false,
    isFocused: false,
  })

  const isUnsupported = useMemo(() => isUnsupportedBrowser(), [])

  const handleButtonClick = () => {
    setState((prevState) => ({ ...prevState, step: 2 }))
    onStepChange?.(2)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState((prevState) => ({ ...prevState, searchText: e.target.value }))
  }

  const handleSearchSubmit = async () => {
    if (state.searchText.trim() !== "" && !state.isLoading) {
      setState((prevState) => ({ ...prevState, isLoading: true }))

      const searchPromise = onSubmit
        ? onSubmit(state.searchText)
        : Promise.resolve()
      // This promise ensures the loading animation plays for at least 2 seconds.
      const minAnimationPromise = new Promise((resolve) =>
        setTimeout(resolve, 2000)
      )

      await Promise.all([searchPromise, minAnimationPromise])

      setState((prevState) => ({ ...prevState, step: 1, isLoading: false }))
      onStepChange?.(1)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchSubmit()
    }
  }

  useEffect(() => {
    statusRef.current?.scrollIntoView({ block: "nearest", inline: "end" })
  }, [statusText])

  useEffect(() => {
    if (state.step === 2) {
      inputRef.current?.focus()
    } else {
      setState((prevState) => ({
        ...prevState,
        searchText: "",
      }))
    }
  }, [state.step])

  useEffect(() => {
    if (
      !state.isFocused &&
      state.searchText.trim() === "" &&
      !state.isLoading
    ) {
      setState((prevState) => ({ ...prevState, step: 1 }))
      onStepChange?.(1)
    }
  }, [state.isFocused, state.searchText, state.isLoading, onStepChange])

  return (
    <div className={clsx("wrapper", isUnsupported && "no-goo", className)}>
      <GooeyFilter />
      <div className="main-content-container">
        <div className="button-content">
          <motion.div
            ref={containerRef}
            className={clsx("button-content-inner", "chat-input-main")}
            initial="initial"
            animate={state.step === 1 ? "step1" : "step2"}
            transition={{ duration: 0.75, type: "spring", bounce: 0.15 }}
          >
            <AnimatePresence mode="popLayout">
              <motion.div
                key="search-text-wrapper"
                className="search-results"
                role="listbox"
                aria-label="Search results"
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  delay: isUnsupported ? 0.5 : 1.25,
                  duration: 0.5,
                }}
              >
                <AnimatePresence mode="popLayout">
                  {state.isLoading && (
                    <motion.div
                      key="loading-text"
                      variants={getResultItemVariants(0, isUnsupported)}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={getResultItemTransition(0)}
                      className="search-result"
                      role="status"
                    >
                      <div className="search-result-title">
                        <motion.span
                          ref={statusRef}
                          key={statusText ?? "default"}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.15 }}
                        >
                          {statusText ?? "در حال پردازش ..."}
                        </motion.span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>

            <motion.div
              variants={buttonVariants}
              onClick={state.step === 1 ? handleButtonClick : undefined}
              whileHover={{ scale: state.step === 2 ? 1 : 1.03 }}
              whileTap={{ scale: 0.95 }}
              className="search-btn"
              role="button"
            >
              {state.step === 1 ? (
                <span className="search-text">{buttonText}</span>
              ) : (
                <input
                  ref={inputRef}
                  type="text"
                  className="search-input"
                  placeholder={placeholderText}
                  aria-label="Search input"
                  onChange={handleSearch}
                  onKeyDown={handleKeyDown}
                  value={state.searchText}
                  onFocus={() =>
                    setState((prevState) => ({ ...prevState, isFocused: true }))
                  }
                  onBlur={() =>
                    setState((prevState) => ({
                      ...prevState,
                      isFocused: false,
                    }))
                  }
                />
              )}
            </motion.div>

            <AnimatePresence mode="wait">
              {state.step === 2 && (
                <motion.div
                  key="icon"
                  className="separate-element"
                  tabIndex={-1}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={iconVariants}
                  transition={{
                    delay: 0.1,
                    duration: 0.85,
                    type: "spring",
                    bounce: 0.15,
                  }}
                  onClick={handleSearchSubmit}
                >
                  {!state.isLoading ? (
                    <SearchIcon isUnsupported={isUnsupported} />
                  ) : (
                    <LoadingIcon />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
