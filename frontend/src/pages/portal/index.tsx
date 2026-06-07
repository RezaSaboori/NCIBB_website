// @ts-nocheck
import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { Canvas } from "@react-three/fiber"
import { Environment, OrbitControls } from "@react-three/drei"
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
import * as THEME_CONFIG from "../../components/bot/config/themeConfig"
import * as SCENE_CONFIG from "../../components/bot/config/sceneConfig"
import { useTheme as useBotTheme } from "../../components/bot/hooks/useTheme"
import { useIntroAnimation } from "../../components/bot/hooks/useIntroAnimation"
import { useCoreHideAnimation } from "../../components/bot/hooks/useCoreHideAnimation"
import { useAttentionTracking } from "../../components/bot/hooks/useAttentionTracking"
import { useBlinkFSM } from "../../components/bot/hooks/useBlinkFSM"
import { HarmonicDensity } from "../../components/bot/components/HarmonicDensity"
import { UIControls } from "../../components/bot/components/UIControls"
import { CoreSphere } from "../../components/bot/components/CoreSphere"
import { Eyes } from "../../components/bot/components/Eyes"
import { OrbitSystem } from "../../components/bot/components/OrbitSystem"
import { ParticleInstances } from "../../components/bot/components/ParticleInstances"
import { OrbitLines } from "../../components/bot/components/OrbitLines"
import { PostProcessing } from "../../components/bot/components/PostProcessing"
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
  const { theme } = useTheme()
  const [isTextVisible, setIsTextVisible] = useState(false)
  const [isDataVisible, setIsDataVisible] = useState(false)
  const [activeMode, setActiveMode] = useState("datasaz")
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
  const appRef = useRef(null)
  const objRef = useRef(null)
  const modesContainerRef = useRef(null)

  // Bot state management
  const botTheme = useBotTheme()
  const intro = useIntroAnimation(3800, () => {
    setIsTextVisible(true)
    setIsDataVisible(true)
    setChatInputAnimationClass("fade-in-up")
  })
  const hideAnimation = useCoreHideAnimation(true)
  const attentionTracking = useAttentionTracking()
  const blinkFSM = useBlinkFSM(attentionTracking)

  const [ignitionValue, setIgnitionValue] = useState(0)
  const [isGlass, setIsGlass] = useState(true)
  const [isHidden, setIsHidden] = useState(false)

  // Hide animation active state
  const hideAnimationActive = useMemo(() => {
    return !isHidden
  }, [isHidden])

  const selectedFilterValue = useMemo(
    () => Array.from(selectedFilters).join(", ").replace(/_/g, " "),
    [selectedFilters]
  )

  useDataFinderModeIndicator(modesContainerRef, activeMode)

  useEffect(() => {
    const loadDatabases = async () => {
      const data = await getDatabases()
      setDatabases(data)
    }
    loadDatabases()
  }, [])

  const toState = () => {
    if (!objRef.current) return
    objRef.current.transition({ to: "State", duration: 800 })
  }

  const toBase = () => {
    if (!objRef.current) return
    objRef.current.transition({ to: null, duration: 800 }) // null = Base State
  }

  const toState2 = () => {
    if (!objRef.current) return
    objRef.current.transition({ to: "State 2", duration: 800 })
  }

  const handleModeChange = useCallback(
    (mode: string) => {
      if (mode === activeMode) return

      setChatInputAnimationClass("fade-out")
      setDataContainerAnimationClass("fade-out")
      setTimeout(() => {
        switch (mode) {
          case "manual":
            toState2()
            break
          case "datasaz":
            toBase()
            break
          case "datayab":
            toState()
            break
          default:
            toBase()
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
        <Canvas
          dpr={[1, 2]}
          gl={{ antialias: false, alpha: false }}
          shadowMap
          toneMappingExposure={1}
        >
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minDistance={10}
            maxDistance={50}
          />
          <HarmonicDensity>
            <CoreSphere
              theme={botTheme}
              intro={intro}
              hideAnimation={hideAnimationActive ? hideAnimation : null}
              isGlass={isGlass}
            />
            <Eyes
              theme={botTheme}
              intro={intro}
              hideAnimation={hideAnimationActive ? hideAnimation : null}
            />
            <OrbitSystem
              theme={botTheme}
              intro={intro}
              hideAnimation={hideAnimationActive ? hideAnimation : null}
            />
            <ParticleInstances
              theme={botTheme}
              intro={intro}
              orbitIndex={0}
              rippleOffset={0}
            />
            <OrbitLines
              theme={botTheme}
              intro={intro}
              orbitIndex={0}
              totalOrbits={SCENE_CONFIG.CONFIG.orbitCount}
              rippleOffset={0}
            />
            <PostProcessing theme={botTheme} intro={intro} />
          </HarmonicDensity>
        </Canvas>
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
              id="datasaz"
              onClick={() => handleModeChange("datasaz")}
              className={`data-finder-mode ${
                activeMode === "datasaz" ? "active" : ""
              }`}
            >
              داده‌یاب
            </button>

            <button
              id="datayab"
              onClick={() => handleModeChange("datayab")}
              className={`data-finder-mode ${
                activeMode === "datayab" ? "active" : ""
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
                      {selectedFilterValue || "فیلتر"}
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
        {activeMode === "datayab" ? (
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
