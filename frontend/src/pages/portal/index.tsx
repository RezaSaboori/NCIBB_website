// @ts-nocheck
import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Input,
} from "@heroui/react"
import { AnimatePresence, motion } from "framer-motion"
import { useTheme } from "../../components/theme/ThemeContext"
import { ChatInput } from "../../components/ChatInput"
import { DataCard } from "../../components/DataCard"
import { useDataFinderModeIndicator } from "./hooks/useDataFinderModeIndicator"
import { getDatabases } from "./utils/csv"
import { DatabaseInfo } from "../../types/database"
import { searchInCsv } from "../../components/Search"
import { refreshButtonVariants } from "../../components/ChatInput/animations"
import { RefreshIcon } from "../../components/ChatInput/icons/RefreshIcon"
import { HarmonicDensity } from "../../components/bot/components/HarmonicDensity"
import { THEMES } from "../../components/bot/config/themeConfig";
import "./styles.css"
import generatedImage from "../../../data/Gemini_Generated_Image_sc72gssc72gssc72.png"

const chatInputConfig = {
  datasaz: {
    buttonText: "داده‌ای که می‌خواهید جستجو کنید رو توصیف کنید.",
    placeholderText: "مثال: داده‌ای با ۱۰۰۰ سطر و ستون‌های سن، جنسیت و تحصیلات",
  },
  datayab: {
    buttonText: "ویژگی‌های داده مورد نظر خود را برای ساخت وارد کنید.",
    placeholderText:
      "مثال: داده ای برای پیش بینی نارسایی قلب از روی داده نوار قلب",
  },
  manual: {
    buttonText: "کلیدواژه‌های داده‌ای که می‌خواهید جستجو کنید رو وارد کنید.",
    placeholderText: 'مثال: "ECG" AND "Heart Failure" OR "Heart Disease"',
  },
}

export const PortalPage = () => {
  const { theme: appTheme } = useTheme()
  // Use app theme directly for bot instead of separate botTheme hook
  const botTheme = useMemo(() => ({
    themeKey: appTheme === 'dark' ? 'dark' : 'light',
    currentTheme: appTheme === 'dark' ? THEMES.dark : THEMES.light,
    isDarkMode: appTheme === 'dark',
    toggleTheme: () => {}
  }), [appTheme])
  const [isTextVisible, setIsTextVisible] = useState(false)
  const [isDataVisible, setIsDataVisible] = useState(false)
  const [activeMode, setActiveMode] = useState("datayab")
  const [chatInputStep, setChatInputStep] = useState(1)
  const [databases, setDatabases] = useState<DatabaseInfo[]>([])
  const [chatInputAnimationClass, setChatInputAnimationClass] = useState("")
  const [dataContainerAnimationClass, setDataContainerAnimationClass] =
    useState("")
  const [searchResults, setSearchResults] = useState<DatabaseInfo[]>([])
  const [searchAttempted, setSearchAttempted] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState<"all" | Set<string>>(
    new Set()
  )
  const [selectedSort, setSelectedSort] = useState<"all" | Set<string>>(
    new Set(["سال"])
  )
  const [selectedSearchSubject, setSelectedSearchSubject] = useState<
    "all" | Set<string>
  >(new Set(["همه"]))
  const [manualSort, setManualSort] = useState<"all" | Set<string>>(
    new Set(["سال"])
  )
  const [filterSearch, setFilterSearch] = useState("")
  const [isCoreVisible, setIsCoreVisible] = useState(true)
  const [isGlass, setIsGlass] = useState(true)
  const [ignition, setIgnition] = useState(0)
  const [isIntroActive, setIsIntroActive] = useState(true)
  const modesContainerRef = useRef(null)

  useDataFinderModeIndicator(modesContainerRef, activeMode)

  useEffect(() => {
    const loadDatabases = async () => {
      const data = await getDatabases()
      setDatabases(data)
    }
    loadDatabases()
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      setIsTextVisible(true)
      setIsDataVisible(true)
      setChatInputAnimationClass("fade-in-up")
    }, 2000)
    return () => clearTimeout(t)
  }, [])

  const handleModeChange = useCallback(
    (mode: string) => {
      if (mode === activeMode) return

      setChatInputAnimationClass("fade-out")
      setDataContainerAnimationClass("fade-out")
      setTimeout(() => {
        switch (mode) {
          case "manual":
            setIsCoreVisible(false)
            break
          case "datasaz":
            setIsCoreVisible(true)
            setIsGlass(false)
            break
          case "datayab":
            setIsCoreVisible(true)
            setIsGlass(true)
            break
          default:
            break
        }
        setActiveMode(mode)
        if (mode === "datasaz" || mode === "datayab") {
          setSelectedSort(new Set(["سال"]))
        } else if (mode === "manual") {
          setSelectedSort(manualSort)
        }
        if (mode !== "manual") {
          setSearchAttempted(false)
          setSearchResults([])
        }
        setTimeout(() => {
          setChatInputAnimationClass("fade-in")
        }, 400)
        setDataContainerAnimationClass("fade-in")
      }, 300) // This duration should match the CSS animation duration
    },
    [activeMode, manualSort]
  )

  const handleSearch = async (query: string) => {
    setSearchAttempted(true)
    const searchStartTime = Date.now()
    const minAnimationTime = 2000 // Corresponds to ChatInput's animation
    const fadeAnimationTime = 300

    // Fade out current results and wait for the animation to finish.
    setDataContainerAnimationClass("fade-out")
    await new Promise((resolve) => setTimeout(resolve, fadeAnimationTime))

    const subject =
      selectedSearchSubject instanceof Set
        ? selectedSearchSubject.values().next().value
        : "همه"
    const results = await searchInCsv(query, subject)
    const searchDuration = Date.now() - searchStartTime

    // Ensure the loading animation is visible for a minimum duration.
    if (searchDuration < minAnimationTime) {
      await new Promise((resolve) =>
        setTimeout(resolve, minAnimationTime - searchDuration)
      )
    }

    setSearchResults(results)

    // Fade in new results.
    setDataContainerAnimationClass("fade-in")
  }

  const handleClearSearch = async () => {
    console.log("Refresh button clicked")
    const fadeAnimationTime = 300
    setDataContainerAnimationClass("fade-out")
    await new Promise((resolve) => setTimeout(resolve, fadeAnimationTime))
    setSearchAttempted(false)
    setSearchResults([])
    setDataContainerAnimationClass("fade-in")
  }

  const filterTags = useMemo(() => {
    const allTags = new Set<string>()
    databases.forEach((db) => {
      db.datasetVariables.forEach((tag) => {
        allTags.add(tag)
      })
    })
    return Array.from(allTags).sort((a, b) => a.localeCompare(b, "fa"))
  }, [databases])

  const displayedDatabases =
    activeMode === "manual" && searchAttempted ? searchResults : databases

  const processedDatabases = useMemo(() => {
    let filtered = displayedDatabases

    // Filtering logic
    if (selectedFilters instanceof Set && selectedFilters.size > 0) {
      filtered = displayedDatabases.filter((db) =>
        db.datasetVariables.some((tag) => selectedFilters.has(tag))
      )
    }

    // Sorting logic
    const sortKey =
      selectedSort instanceof Set
        ? selectedSort.values().next().value
        : selectedSort

    if (sortKey) {
      return [...filtered].sort((a, b) => {
        switch (sortKey) {
          case "امتیاز":
            return b.rating - a.rating
          case "الفبا":
            return a.name.localeCompare(b.name)
          case "سال":
            return b.year - a.year
          case "حجم":
            return b.fileSizeKB - a.fileSizeKB
          default:
            return 0
        }
      })
    }

    return filtered
  }, [displayedDatabases, selectedFilters, selectedSort])

  return (
    <div className="holistic-page-wrapper">
      <div className="spline-container">
        <HarmonicDensity
          theme={botTheme}
          isGlass={isGlass}
          isCoreVisible={isCoreVisible}
          ignition={ignition}
          setIntroActive={setIsIntroActive}
        />
      </div>

      <div className="robot-container">
        <div
          className={`holistic-input-container ${
            isTextVisible ? "fade-in-up" : ""
          }`}
        >
          <div ref={modesContainerRef} className="data-finder-modes-container">
            <button
              id="manual"
              onClick={() => handleModeChange("manual")}
              className={`data-finder-mode ${
                activeMode === "manual" ? "active" : ""
              }`}
            >
              دستی
            </button>
            <button
              id="datayab"
              onClick={() => handleModeChange("datayab")}
              className={`data-finder-mode ${
                activeMode === "datayab" ? "active" : ""
              }`}
            >
              داده‌یاب
            </button>

            <button
              id="datasaz"
              onClick={() => handleModeChange("datasaz")}
              className={`data-finder-mode ${
                activeMode === "datasaz" ? "active" : ""
              }`}
            >
              داده‌ساز
            </button>
          </div>
          <div className={`search-controls ${chatInputAnimationClass}`}>
            {activeMode === "manual" && (
              <div className="controls-container">
                <Dropdown
                  showArrow={true}
                  classNames={{
                    content: "rounded-3xl",
                  }}
                >
                  <DropdownTrigger>
                    <Button
                      variant="solid"
                      className="sort-dropdown-trigger rounded-full"
                      style={{
                        backgroundColor: "var(--color-gray1)",
                        fontFamily: "var(--font-family-persian)",
                        fontWeight: "var(--font-weight-medium)",
                        fontSize: "var(--font-size-sm)",
                        cursor: "pointer",
                      }}
                    >
                      موضوع جستجو:{" "}
                      {typeof selectedSearchSubject === "string"
                        ? selectedSearchSubject
                        : selectedSearchSubject.values().next().value}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Single selection for search subject"
                    variant="flat"
                    disallowEmptySelection
                    selectionMode="single"
                    selectedKeys={selectedSearchSubject}
                    onSelectionChange={(keys) => {
                      const newSearchSubject = keys as "all" | Set<string>
                      setSelectedSearchSubject(newSearchSubject)
                    }}
                    itemClasses={{
                      base: [
                        "text-[var(--color-gray11)]",
                        "data-[hover=true]:bg-default-100",
                        "rounded-full",
                        "px-3",
                        "font-family: var(--font-family-persian);",
                        "font-weight: var(--font-weight-medium);",
                        "font-size: var(--font-size-sm);",
                      ],
                    }}
                  >
                    <DropdownItem key="همه">همه</DropdownItem>
                    <DropdownItem key="عنوان">عنوان</DropdownItem>
                    <DropdownItem key="توضیحات">توضیحات</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
                <Dropdown
                  showArrow={true}
                  classNames={{
                    content: "rounded-3xl bg-gray1",
                  }}
                >
                  <DropdownTrigger>
                    <Button
                      variant="solid"
                      className="filter-dropdown-trigger rounded-full"
                      style={{
                        backgroundColor: "var(--color-gray1)",
                        color: "var(--color-gray11)",
                        fontFamily: "var(--font-family-persian)",
                        fontWeight: "var(--font-weight-medium)",
                        fontSize: "var(--font-size-sm)",
                        cursor: "pointer",
                      }}
                    >
                      {selectedFilters instanceof Set && selectedFilters.size > 0
                        ? Array.from(selectedFilters).join(", ")
                        : "فیلتر"}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Multiple selection for filtering"
                    variant="flat"
                    closeOnSelect={false}
                    selectionMode="multiple"
                    selectedKeys={selectedFilters}
                    onSelectionChange={(keys) =>
                      setSelectedFilters(keys as "all" | Set<string>)
                    }
                    topContent={
                      <Input
                        isClearable
                        radius="full"
                        placeholder="جستجوی فیلتر"
                        value={filterSearch}
                        onValueChange={setFilterSearch}
                        onClear={() => setFilterSearch("")}
                        className="filter-search-input"
                        color="primary"
                      />
                    }
                    classNames={{
                      list: "max-h-60 overflow-y-auto custom-scrollbar",
                    }}
                    itemClasses={{
                      base: [
                        "text-[var(--color-gray11)]",
                        "data-[hover=true]:bg-[var(--color-gray3)]",
                        "rounded-full",
                        "px-3",
                        "ltr-direction",
                        "flex-row-reverse",
                      ],
                    }}
                  >
                    {filterTags
                      .filter((tag) =>
                        tag.toLowerCase().includes(filterSearch.toLowerCase())
                      )
                      .map((tag) => (
                        <DropdownItem key={tag}>{tag}</DropdownItem>
                      ))}
                  </DropdownMenu>
                </Dropdown>

                <Dropdown
                  showArrow={true}
                  classNames={{
                    content: "rounded-3xl",
                  }}
                >
                  <DropdownTrigger>
                    <Button
                      variant="solid"
                      className="sort-dropdown-trigger rounded-full"
                      style={{
                        backgroundColor: "var(--color-gray1)",
                        fontFamily: "var(--font-family-persian)",
                        fontWeight: "var(--font-weight-medium)",
                        fontSize: "var(--font-size-sm)",
                        cursor: "pointer",
                      }}
                    >
                      مرتب‌سازی بر اساس:{" "}
                      {typeof selectedSort === "string"
                        ? selectedSort
                        : selectedSort.values().next().value}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Single selection for sorting"
                    variant="flat"
                    disallowEmptySelection
                    selectionMode="single"
                    selectedKeys={selectedSort}
                    onSelectionChange={(keys) => {
                      const newSort = keys as "all" | Set<string>
                      setSelectedSort(newSort)
                      if (activeMode === "manual") {
                        setManualSort(newSort)
                      }
                    }}
                    itemClasses={{
                      base: [
                        "text-[var(--color-gray11)]",
                        "data-[hover=true]:bg-default-100",
                        "rounded-full",
                        "px-3",
                        "font-family: var(--font-family-persian);",
                        "font-weight: var(--font-weight-medium);",
                        "font-size: var(--font-size-sm);",
                      ],
                    }}
                  >
                    <DropdownItem key="امتیاز">امتیاز</DropdownItem>
                    <DropdownItem key="الفبا">الفبا</DropdownItem>
                    <DropdownItem key="سال">سال</DropdownItem>
                    <DropdownItem key="حجم">حجم</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            )}
            <div className={`input-refresh-container step-${chatInputStep}`}>
              {activeMode === "manual" && (
                <AnimatePresence>
                  {searchAttempted && (
                    <motion.div
                      key="refresh-fab"
                      className="refresh-fab"
                      variants={refreshButtonVariants(false)}
                      initial="hidden"
                      animate={"visibleStep1"}
                      exit="hidden"
                      onClick={handleClearSearch}
                      onMouseDown={(e) => e.preventDefault()}
                      role="button"
                      aria-label="Refresh results"
                    >
                      <RefreshIcon />
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
              <ChatInput
                className="chat-input-override"
                buttonText={chatInputConfig[activeMode].buttonText}
                placeholderText={chatInputConfig[activeMode].placeholderText}
                onSubmit={activeMode === "manual" ? handleSearch : undefined}
                onStepChange={setChatInputStep}
              />
            </div>
          </div>
        </div>
      </div>
      <div
        className={`data-container ${dataContainerAnimationClass} ${
          activeMode === "manual" ? "manual-mode" : ""
        }`}
      >
        {activeMode === "datasaz" ? (
          <div className="generated-image-container">
            <img
              src={generatedImage}
              alt="Generated Data Visualization"
              className="generated-image"
            />
          </div>
        ) : (
          <>
            {processedDatabases.length === 0 &&
            (searchAttempted ||
              (selectedFilters instanceof Set && selectedFilters.size > 0)) ? (
              <div className="no-results-message">
                <p>متاسفانه داده‌ای مطابق با جستجوی شما یافت نشد.</p>
                <p>لطفاً کلیدواژه‌های دیگری را امتحان کنید.</p>
              </div>
            ) : (
              <>
                <div className="data-column">
                  {processedDatabases
                    .filter((_, index) => index % 2 === 0)
                    .map((db, index) => (
                      <DataCard
                        key={db.name}
                        database={db}
                        isVisible={isDataVisible}
                        animationDelay={index * 300} // Adjusted delay for column-based animation
                      />
                    ))}
                </div>
                <div className="data-column">
                  {processedDatabases
                    .filter((_, index) => index % 2 !== 0)
                    .map((db, index) => (
                      <DataCard
                        key={db.name}
                        database={db}
                        isVisible={isDataVisible}
                        animationDelay={150 + index * 300} // Adjusted delay for column-based animation
                      />
                    ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
