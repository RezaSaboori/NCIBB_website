import type { SmartDatasetSort } from "./datasetSearchOptions";

import { useMemo, useRef, useState } from "react";

import { DatasazMode } from "../dataset/datasaz";

import { DatasetSearchForm } from "./components/DatasetSearchForm";
import { DatasetResults } from "./components/DatasetResults";
import { useDataFinderModeIndicator } from "./hooks/useDataFinderModeIndicator";
import { useDatasetCatalog } from "./hooks/useDatasetCatalog";
import { useDatasetSearch } from "./hooks/useDatasetSearch";

import { THEMES } from "@/components/bot/config/themeConfig";
import { HarmonicDensity } from "@/components/bot/components/HarmonicDensity";
import { useTheme } from "@/components/theme/ThemeContext";
import { useNavigationFade } from "@/components/ui/motion/useNavigationFade";
import "./styles.css";

type FinderMode = "datasets" | "database";

const finderModes = [
  { id: "datasets", label: "پکیج آماده" },
  { id: "database", label: "پکیج شخصی" },
] as const;

const ignoreIntro = () => {};

export function PortalPage() {
  const { theme } = useTheme();
  const botTheme = useMemo(() => {
    const themeKey = theme === "dark" ? "dark" : "light";

    return {
      themeKey,
      currentTheme: THEMES[themeKey],
      isDarkMode: themeKey === "dark",
    };
  }, [theme]);
  const [activeMode, setActiveMode] = useState<FinderMode>("datasets");
  const [smartSort, setSmartSort] = useState<SmartDatasetSort>("شباهت");
  const modesRef = useRef<HTMLDivElement>(null);
  const contentRef = useNavigationFade(activeMode);

  useDataFinderModeIndicator(modesRef, activeMode);

  const { catalog, reload } = useDatasetCatalog();
  const catalogData = catalog.phase === "ready" ? catalog.data : undefined;
  const search = useDatasetSearch(catalogData);
  const tags = useMemo(() => {
    const values = new Set(
      catalogData?.flatMap((dataset) => dataset.datasetVariables),
    );

    return Array.from(values).sort((a, b) => a.localeCompare(b, "fa"));
  }, [catalogData]);
  const databaseMode = activeMode === "database";
  const manualMode = search.mode === "manual";
  const resultData = search.state.results;
  const pending = search.state.phase === "pending";

  const selectFinderMode = (mode: FinderMode) => {
    if (mode === activeMode) return;
    if (mode === "database") search.clearResults();
    setActiveMode(mode);
  };

  return (
    <div className="portal-finder">
      <div aria-hidden="true" className="portal-finder__scene">
        <HarmonicDensity
          ignition={0}
          isCoreVisible={databaseMode || !manualMode}
          isGlass={!databaseMode}
          setIntroActive={ignoreIntro}
          theme={botTheme}
        />
      </div>
      <div
        className={`page-container portal-finder__stage${databaseMode ? " portal-finder__stage--database" : ""}`}
      >
        <div
          ref={modesRef}
          aria-label="نوع داده"
          className="data-finder-modes-container glass-navigation glass-navigation__indicator glass-transparent"
          role="group"
        >
          {finderModes.map(({ id, label }) => (
            <button
              key={id}
              aria-pressed={activeMode === id}
              className="data-finder-mode glass-navigation__item"
              id={id}
              type="button"
              onClick={() => selectFinderMode(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <section
          ref={contentRef}
          aria-label={databaseMode ? "دیتابیس" : "دیتاست"}
          className="portal-finder__content"
        >
          {databaseMode ? (
            <DatasazMode />
          ) : (
            <DatasetSearchForm
              catalogReady={Boolean(catalogData)}
              manual={search.manual}
              mode={search.mode}
              query={search.query}
              smartSort={smartSort}
              state={search.state}
              tags={tags}
              onManualChange={search.setManual}
              onModeChange={search.selectMode}
              onQueryChange={search.changeQuery}
              onReset={search.reset}
              onSmartSortChange={setSmartSort}
              onSubmit={search.submit}
            />
          )}
        </section>
      </div>
      {!databaseMode && (
        <DatasetResults
          data={resultData ?? catalogData}
          error={!resultData && !pending && catalog.phase === "error"}
          loading={!resultData && !pending && catalog.phase === "loading"}
          pending={pending}
          sort={
            manualMode
              ? search.manual.sort
              : !resultData && smartSort === "شباهت"
                ? "سال"
                : smartSort
          }
          variables={manualMode ? search.manual.variables : undefined}
          onReload={reload}
          onSmartSortChange={
            !manualMode && resultData?.length ? setSmartSort : undefined
          }
        />
      )}
    </div>
  );
}
