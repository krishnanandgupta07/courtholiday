import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { CourtCategory, ViewScope } from '../types/api'
import {
  defaultViewMonth,
  filterHolidaysByMonth,
} from '../utils/calendar'
import { filterCourtsByCategory, filterHolidayCourtName } from '../utils/courtCategory'
import { courtHolidayPath } from '../seo/slugs'
import { clampToSelectableYear, isYearSelectable } from '../utils/yearAvailability'
import { AppHeader } from './AppHeader'
import { CalendarPanel } from './CalendarPanel'
import { DateWiseView } from './DateWiseView'
import { DisclaimerMarquee } from './DisclaimerMarquee'
import { DocketList } from './DocketList'
import { AppDownloadBanner } from './AppDownloadBanner'
import { Footer } from './Footer'
import { SelectorBar } from './SelectorBar'
import { useHolidays } from '../hooks/useHolidays'

/** Supreme Court only: hides court/bench pickers (single court & bench; year selector only) */
const PICKER_HIDDEN_CATEGORIES: CourtCategory[] = ['supreme-court']

/** Both HC & SC: auto-loads calendar without pressing "View Calendar" */
const AUTO_LOAD_CATEGORIES: CourtCategory[] = ['high-court', 'supreme-court']

/** Default court name substring for High Court auto-selection */
const HC_DEFAULT_COURT = 'Telangana High Court'
const HC_DEFAULT_BENCH = 'Hyderabad'

/** Supreme Court auto-selection — picks the first available court/bench */
const SC_DEFAULT_COURT = 'Supreme Court of India'

export interface CourtHolidayCalendarProps {
  onContactClick?: () => void
  onHomeClick?: () => void
  /** URL-driven court category (SEO routes). */
  initialCategory?: CourtCategory
  /** URL-driven court name (exact or partial match). */
  initialCourtName?: string
  /** URL-driven preferred bench name substring. */
  initialBenchName?: string
  /** URL-driven year. */
  initialYear?: number
  /** Single page H1 for SEO (visually compact under the disclaimer strip). */
  pageTitle?: string
  /** Optional chrome above the page title (kept for non-calendar pages). */
  topSlot?: ReactNode
  /** FAQ / internal links above the footer. */
  bottomSlot?: ReactNode
  /** Optional callback when holidays load (for live FAQ enrichment). */
  onHolidaysChange?: (payload: {
    holidays: ReturnType<typeof useHolidays>['holidays']
    courtName: string
    year: number
    courts: ReturnType<typeof useHolidays>['courts']
    years: number[]
  }) => void
}

export function CourtHolidayCalendar({
  onContactClick,
  onHomeClick,
  initialCategory = 'high-court',
  initialCourtName,
  initialBenchName,
  initialYear,
  pageTitle,
  bottomSlot,
  onHolidaysChange,
}: CourtHolidayCalendarProps) {
  const {
    years,
    courts,
    benches,
    courtsState,
    reloadCourts,
    selectedCourt,
    selectCourt,
    selectedBenchId,
    setSelectedBenchId,
    selectedYear,
    setSelectedYear,
    selectedDate,
    setSelectedDate,
    holidays,
    holidaysState,
    hasLoadedHolidays,
    viewLabel,
    loadedDate,
    loadHolidays,
    loadHolidaysByDate,
    retryHolidays,
    retryHolidaysByDate,
    clearHolidayResults,
  } = useHolidays()

  const navigate = useNavigate()
  const location = useLocation()
  /** After category switch, sync SEO URL once the auto-selected court is ready */
  const pendingCategoryUrlSyncRef = useRef(false)

  /** Navigate to the SEO path for the current court + year (e.g. /delhi-high-court-holidays-2026) */
  const goToCourtUrl = useCallback(
    (courtName: string, year: number, category: CourtCategory) => {
      if (!courtName || !Number.isFinite(year)) return
      const nextPath = courtHolidayPath(courtName, year, category)
      if (location.pathname === nextPath) return
      navigate(nextPath)
    },
    [location.pathname, navigate],
  )

  const [courtCategory, setCourtCategory] =
    useState<CourtCategory>(initialCategory)
  const [viewScope, setViewScope] = useState<ViewScope>('month')
  /**
   * Explicit reload flag so the skeleton stays visible across court/bench changes
   * and URL remounts (React can skip painting when cache resolves in one tick).
   */
  const [showReloadSkeleton, setShowReloadSkeleton] = useState(
    () =>
      Boolean(initialCourtName) ||
      initialCategory === 'high-court' ||
      initialCategory === 'supreme-court',
  )

  useEffect(() => {
    if (holidaysState.error) {
      setShowReloadSkeleton(false)
      return
    }
    if (hasLoadedHolidays && !holidaysState.loading) {
      setShowReloadSkeleton(false)
    }
  }, [hasLoadedHolidays, holidaysState.error, holidaysState.loading])

  // When the SEO route court/year changes, show skeleton until data arrives
  useEffect(() => {
    if (initialCourtName || initialYear != null) {
      setShowReloadSkeleton(true)
    }
  }, [initialCourtName, initialYear])

  // Apply URL year whenever the route year changes (clamp unreleased next year)
  useEffect(() => {
    if (initialYear == null) return
    const year = clampToSelectableYear(initialYear)
    setSelectedYear(year)

    // If URL asked for next year before 15 Dec, rewrite to the released year path
    if (
      year !== initialYear &&
      initialCourtName &&
      isYearSelectable(year)
    ) {
      const nextPath = courtHolidayPath(
        initialCourtName,
        year,
        initialCategory,
      )
      if (location.pathname !== nextPath) {
        navigate(nextPath, { replace: true })
      }
    }
  }, [
    initialCategory,
    initialCourtName,
    initialYear,
    location.pathname,
    navigate,
    setSelectedYear,
  ])

  // Sync category / allow re-auto-select when the SEO route court changes
  useEffect(() => {
    setCourtCategory(initialCategory)
    autoSelectedRef.current = ''
    benchAutoAppliedRef.current = ''
  }, [initialCategory, initialCourtName, initialYear])

  const isBenchView = viewScope === 'month' || viewScope === 'year'
  const isYearView = viewScope === 'year'
  const isDateView = viewScope === 'date'
  const showDocketList = !isYearView && !isDateView
  const showSidebar = !isDateView && !courtsState.loading && isBenchView

  const calendarYear = viewLabel?.year ?? selectedYear
  const [viewMonth, setViewMonth] = useState(() =>
    defaultViewMonth(calendarYear),
  )

  const filteredCourts = useMemo(
    () => filterCourtsByCategory(courts, courtCategory),
    [courts, courtCategory],
  )

  useEffect(() => {
    setViewMonth(defaultViewMonth(calendarYear))
  }, [calendarYear, hasLoadedHolidays])

  /** True only for Supreme Court — hides court/bench pickers */
  const isAutoCategory = PICKER_HIDDEN_CATEGORIES.includes(courtCategory)
  /** Auto-load when HC/SC, or when a specific court was provided via SEO URL */
  const isAutoLoad =
    AUTO_LOAD_CATEGORIES.includes(courtCategory) || Boolean(initialCourtName)

  // ── Auto-select default court + bench when courts load / category changes ──
  const autoSelectedRef = useRef<string>('')

  const applyAutoDefault = useCallback(() => {
    if (!isAutoLoad || courtsState.loading || courts.length === 0) return

    // One-shot per category/URL court — do not re-apply after the user picks another court
    const scopeKey = `${courtCategory}:${initialCourtName ?? ''}`
    if (autoSelectedRef.current === scopeKey) return

    const allCategoryCourts = filterCourtsByCategory(courts, courtCategory)
    let matchedCourt = allCategoryCourts[0]

    if (initialCourtName) {
      matchedCourt =
        allCategoryCourts.find(
          (c) =>
            c.courtName.toLowerCase() === initialCourtName.toLowerCase(),
        ) ??
        allCategoryCourts.find((c) =>
          c.courtName.toLowerCase().includes(initialCourtName.toLowerCase()),
        ) ??
        matchedCourt
    } else if (courtCategory === 'high-court') {
      matchedCourt =
        allCategoryCourts.find((c) =>
          c.courtName.toLowerCase().includes(HC_DEFAULT_COURT.toLowerCase()),
        ) ?? matchedCourt
    } else if (courtCategory === 'supreme-court') {
      matchedCourt =
        allCategoryCourts.find((c) =>
          c.courtName.toLowerCase().includes(SC_DEFAULT_COURT.toLowerCase()),
        ) ?? matchedCourt
    }

    if (!matchedCourt) return

    selectCourt(matchedCourt.courtName)
    autoSelectedRef.current = scopeKey
  }, [
    courtCategory,
    courts,
    courtsState.loading,
    initialCourtName,
    isAutoLoad,
    selectCourt,
  ])

  useEffect(() => {
    applyAutoDefault()
  }, [applyAutoDefault])

  const benchAutoAppliedRef = useRef<string>('')

  useEffect(() => {
    if (!isAutoLoad || !selectedCourt || benches.length === 0) return

    // Keep user's bench if it still belongs to the current court
    if (selectedBenchId != null) {
      const stillValid = benches.some((b) => b.id === selectedBenchId)
      if (stillValid) {
        benchAutoAppliedRef.current = selectedCourt
        return
      }
    }

    // Prefer URL / default bench only on first apply for this court
    let targetBench = benches[0]
    const preferDefaultHyderabad =
      courtCategory === 'high-court' &&
      !initialCourtName &&
      selectedCourt.toLowerCase().includes(HC_DEFAULT_COURT.toLowerCase())
    const preferredBench =
      initialBenchName ?? (preferDefaultHyderabad ? HC_DEFAULT_BENCH : undefined)
    if (preferredBench) {
      const found = benches.find((b) =>
        b.name.toLowerCase().includes(preferredBench.toLowerCase()),
      )
      if (found) targetBench = found
    }

    setSelectedBenchId(targetBench.id)
    benchAutoAppliedRef.current = selectedCourt
  }, [
    benches,
    courtCategory,
    initialBenchName,
    initialCourtName,
    isAutoLoad,
    selectedBenchId,
    selectedCourt,
    setSelectedBenchId,
  ])

  const dateLoadedKeyRef = useRef<string>('')

  useEffect(() => {
    if (!isAutoLoad || isDateView || selectedBenchId == null || !selectedCourt) {
      return
    }
    // loadHolidays is generation-guarded; calling on bench/year change is enough.
    // Do not gate with a "already loaded" ref — aborted requests must be allowed to retry.
    void loadHolidays()
  }, [
    isAutoLoad,
    isDateView,
    loadHolidays,
    selectedBenchId,
    selectedCourt,
    selectedYear,
  ])

  // Notify parent for live FAQ enrichment
  useEffect(() => {
    onHolidaysChange?.({
      holidays,
      courtName: selectedCourt,
      year: selectedYear,
      courts,
      years,
    })
  }, [courts, holidays, onHolidaysChange, selectedCourt, selectedYear, years])

  const handleCourtChange = (courtName: string) => {
    if (courtName === selectedCourt) return
    benchAutoAppliedRef.current = ''
    setShowReloadSkeleton(true)
    selectCourt(courtName)
    // Show loading skeleton while bench auto-select + holiday fetch run
    if (isAutoLoad) clearHolidayResults({ pending: true })
    // Keep browser URL in sync with the selected court (SEO-friendly path)
    goToCourtUrl(courtName, selectedYear, courtCategory)
  }

  const handleBenchChange = (benchId: number | null) => {
    if (benchId === selectedBenchId) return
    setShowReloadSkeleton(true)
    setSelectedBenchId(benchId)
    if (isAutoLoad) clearHolidayResults({ pending: true })
  }

  const handleCourtCategoryChange = (category: CourtCategory) => {
    if (category === courtCategory) return
    autoSelectedRef.current = ''
    benchAutoAppliedRef.current = ''
    pendingCategoryUrlSyncRef.current = true
    const willAutoLoad =
      AUTO_LOAD_CATEGORIES.includes(category) || Boolean(initialCourtName)
    setShowReloadSkeleton(willAutoLoad)
    setCourtCategory(category)
    selectCourt('')
    setSelectedBenchId(null)
    if (!isDateView) {
      clearHolidayResults({ pending: willAutoLoad })
    }
  }

  const handleDateChange = (date: string) => {
    if (date !== selectedDate) {
      dateLoadedKeyRef.current = ''
    }
    setSelectedDate(date)
  }

  const openDateView = (date: string) => {
    dateLoadedKeyRef.current = ''
    setSelectedDate(date)
    if (viewScope !== 'date') {
      setShowReloadSkeleton(true)
      clearHolidayResults({ pending: true })
      setViewScope('date')
    }
  }

  const handleYearChange = (year: number) => {
    // Block selecting next year from the dropdown before the release date
    if (!isYearSelectable(year)) return
    setSelectedYear(year)
    if (isAutoLoad) {
      setShowReloadSkeleton(true)
      clearHolidayResults({ pending: true })
    }
    // Year change updates path: /delhi-high-court-holidays-2027
    if (selectedCourt) {
      goToCourtUrl(selectedCourt, year, courtCategory)
    }
  }

  // After a category tab change, sync URL once auto-select picks a court
  useEffect(() => {
    if (!pendingCategoryUrlSyncRef.current) return
    if (!selectedCourt) return
    pendingCategoryUrlSyncRef.current = false
    goToCourtUrl(selectedCourt, selectedYear, courtCategory)
  }, [courtCategory, goToCourtUrl, selectedCourt, selectedYear])

  const handleViewScopeChange = (scope: ViewScope) => {
    if (scope === 'summary') return
    if (scope === viewScope) return

    const leavingDate = viewScope === 'date'
    const enteringDate = scope === 'date'

    if (leavingDate || enteringDate) {
      clearHolidayResults({ pending: true })
      if (enteringDate) {
        dateLoadedKeyRef.current = ''
      }
    }

    setViewScope(scope)
  }

  useEffect(() => {
    if (!isDateView || !selectedDate) return
    if (dateLoadedKeyRef.current === selectedDate) return
    dateLoadedKeyRef.current = selectedDate
    void loadHolidaysByDate()
  }, [isDateView, loadHolidaysByDate, selectedDate])

  const visibleHolidays = useMemo(() => {
    if (viewScope === 'date') {
      return holidays.filter((holiday) =>
        filterHolidayCourtName(holiday.courtName, courtCategory),
      )
    }
    if (viewScope === 'year') return holidays
    if (viewScope === 'month') {
      return filterHolidaysByMonth(holidays, calendarYear, viewMonth)
    }
    return []
  }, [holidays, viewScope, calendarYear, viewMonth, courtCategory])

  const openMonthFromYearView = (month: number) => {
    setViewMonth(month)
    setViewScope('month')
  }

  const isUnavailableCategory =
    (courtCategory === 'district-court' || courtCategory === 'tribunal') &&
    !courtsState.loading &&
    !courtsState.error &&
    filteredCourts.length === 0

  /**
   * Keep calendar/list in a loading state while courts load, bench auto-selects,
   * or holidays are fetching — avoids a blank flash between court/bench changes.
   */
  const awaitingBench =
    isAutoLoad &&
    isBenchView &&
    Boolean(selectedCourt) &&
    selectedBenchId == null &&
    !holidaysState.error

  const holidaysLoading =
    !isUnavailableCategory &&
    (holidaysState.loading || showReloadSkeleton || awaitingBench)

  const dateHolidaysLoading =
    holidaysState.loading ||
    (isDateView && showReloadSkeleton) ||
    (isDateView &&
      Boolean(selectedDate) &&
      !hasLoadedHolidays &&
      !holidaysState.error)

  return (
    /*
      Page scrolls as a whole.
      Mobile: natural document scroll (sidebar → calendar → list). Download strip is in-flow.
      Desktop (lg+): first viewport locks calendar chrome so FAQ sits below the fold.
      Download strip is the last child of the content wrapper; Footer is a sibling after it,
      so the sticky bar stays above Corporate Office. lg padding clears the bar height.
    */
    <div className="flex min-h-screen w-full min-w-0 flex-col bg-parchment bg-parchment-grid bg-grid text-ink">
      <div className="flex w-full min-w-0 flex-1 flex-col">
      <div className="flex w-full min-w-0 flex-col lg:h-svh lg:max-h-svh lg:overflow-hidden lg:pb-[var(--app-download-bar)]">
        <AppHeader
          courtCategory={courtCategory}
          onCourtCategoryChange={handleCourtCategoryChange}
          viewScope={viewScope}
          onViewScopeChange={handleViewScopeChange}
          onHomeClick={onHomeClick}
        />
        <DisclaimerMarquee
          benchId={isDateView ? null : selectedBenchId}
          courtName={selectedCourt || viewLabel?.court || null}
          year={selectedYear}
        />
        {pageTitle ? (
          <div className="shrink-0 border-b border-brassLight/20 bg-parchment px-3 py-1.5 sm:px-4 md:px-6 lg:px-8">
            <h1 className="font-display text-sm leading-tight text-navy sm:text-base md:text-lg">
              {pageTitle}
            </h1>
          </div>
        ) : null}

        <main
          className={
            isYearView
              ? 'flex min-h-0 w-full flex-1 flex-col px-3 py-1.5 sm:px-4 md:px-6 lg:overflow-hidden lg:px-8'
              : 'flex min-h-0 w-full flex-1 flex-col px-3 py-2 sm:px-4 sm:py-3 md:px-6 lg:overflow-hidden lg:px-8'
          }
        >
          {isDateView ? (
            <div className="min-h-0 flex-1 lg:overflow-y-auto">
              <DateWiseView
                selectedDate={selectedDate}
                loadedDate={loadedDate}
                holidays={visibleHolidays}
                loading={dateHolidaysLoading}
                error={holidaysState.error}
                hasLoaded={hasLoadedHolidays}
                onDateChange={handleDateChange}
                onRetry={() => {
                  dateLoadedKeyRef.current = ''
                  retryHolidaysByDate()
                }}
              />
            </div>
          ) : isUnavailableCategory ? (
            <div className="flex min-h-0 flex-1 items-center justify-center px-3 py-6 sm:px-4">
              <section
                aria-labelledby="coming-soon-heading"
                className="w-full max-w-xl border border-brassLight/50 bg-parchment/90 px-6 py-10 text-center shadow-slip sm:px-10"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brass">
                  Coming soon
                </p>
                <h2
                  id="coming-soon-heading"
                  className="mt-2 font-display text-xl text-navy sm:text-2xl"
                >
                  {courtCategory === 'district-court'
                    ? 'District Court holidays'
                    : 'Tribunal holidays'}
                </h2>
                <p className="mt-3 font-body text-sm leading-relaxed text-inkSoft">
                  Holiday calendars for{' '}
                  {courtCategory === 'district-court'
                    ? 'District Courts'
                    : 'Tribunals'}{' '}
                  are not available yet. We are preparing this data and will
                  publish it here soon.
                </p>
                <p className="mt-2 font-body text-sm text-inkSoft">
                  In the meantime, explore Supreme Court or High Court holiday
                  lists.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCourtCategoryChange('supreme-court')}
                    className="min-h-9 rounded-sm border border-brassLight/50 bg-parchment px-3 py-1.5 font-body text-sm font-semibold text-navy transition hover:border-brass hover:bg-parchmentDim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
                  >
                    Supreme Court
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCourtCategoryChange('high-court')}
                    className="min-h-9 rounded-sm border border-brass bg-brass px-3 py-1.5 font-body text-sm font-semibold text-navyDeep transition hover:bg-brassLight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
                  >
                    High Court
                  </button>
                </div>
              </section>
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col">
              {courtsState.error && isBenchView && (
                <div
                  role="alert"
                  className="mb-3 flex shrink-0 flex-wrap items-center justify-between gap-3 border border-burgundy/30 bg-burgundyDim px-4 py-3"
                >
                  <p className="font-body text-sm text-burgundy">
                    Could not load courts: {courtsState.error}
                  </p>
                  <button
                    type="button"
                    onClick={() => void reloadCourts()}
                    className="min-h-10 rounded-sm border border-burgundy/40 bg-parchment px-4 py-2 font-body text-sm text-burgundy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy"
                  >
                    Retry
                  </button>
                </div>
              )}

              <div
                className={[
                  'grid w-full flex-1 gap-2',
                  isYearView && showSidebar
                    ? 'grid-cols-1 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(11rem,12rem)_minmax(0,1fr)] lg:items-stretch'
                    : showSidebar && showDocketList
                      ? 'grid-cols-1 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(12rem,14rem)_minmax(0,1.4fr)_minmax(16rem,1fr)] lg:items-stretch'
                      : showSidebar
                        ? 'grid-cols-1 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(12rem,14rem)_minmax(0,1fr)] lg:items-stretch'
                        : showDocketList
                          ? 'grid-cols-1 md:grid-cols-2 lg:h-full lg:min-h-0 lg:items-stretch'
                          : 'grid-cols-1 lg:h-full lg:min-h-0',
                ].join(' ')}
              >
                {courtsState.loading && isBenchView && !courtsState.error && (
                  <div
                    className="h-28 animate-pulse border border-brassLight/40 bg-parchmentDim/60 sm:h-40 lg:h-auto lg:min-h-[12rem]"
                    aria-busy="true"
                    aria-label="Loading court selectors"
                  />
                )}

                {showSidebar && (
                  <SelectorBar
                    courts={filteredCourts}
                    benches={benches}
                    years={years}
                    selectedCourt={selectedCourt}
                    selectedBenchId={selectedBenchId}
                    selectedYear={selectedYear}
                    selectedDate={selectedDate}
                    mode="bench"
                    isAutoCategory={isAutoCategory}
                    hideSubmitButton={isAutoLoad}
                    courtsLoading={courtsState.loading}
                    holidaysLoading={holidaysLoading}
                    onCourtChange={handleCourtChange}
                    onBenchChange={handleBenchChange}
                    onYearChange={handleYearChange}
                    onDateChange={setSelectedDate}
                    onSubmit={() => void loadHolidays()}
                  />
                )}

                <div className="flex min-h-[20rem] min-w-0 flex-col sm:min-h-[24rem] lg:min-h-0">
                  <CalendarPanel
                    holidays={holidays}
                    year={calendarYear}
                    viewMonth={viewMonth}
                    viewScope={isYearView ? 'year' : 'month'}
                    loading={holidaysLoading}
                    error={holidaysState.error}
                    hasLoaded={hasLoadedHolidays}
                    onRetry={retryHolidays}
                    onViewMonthChange={setViewMonth}
                    onSelectMonthFromYear={openMonthFromYearView}
                    onSelectDate={openDateView}
                  />
                </div>

                {showDocketList && (
                  <div className="flex min-h-[16rem] min-w-0 flex-col sm:min-h-[20rem] lg:min-h-0 lg:h-full">
                    <DocketList
                      holidays={visibleHolidays}
                      loading={holidaysLoading}
                      error={holidaysState.error}
                      hasLoaded={hasLoadedHolidays}
                      year={viewLabel?.year ?? null}
                      viewMonth={viewMonth}
                      viewScope={viewScope}
                      selectedDate={loadedDate ?? selectedDate}
                      courtName={viewLabel?.court ?? selectedCourt}
                      benchName={
                        viewLabel?.bench ??
                        benches.find((bench) => bench.id === selectedBenchId)?.name ??
                        null
                      }
                      onRetry={retryHolidays}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* FAQ / related links sit below the calendar viewport — page scrolls to them */}
      {bottomSlot ? (
        <div className="border-t border-brassLight/20 bg-parchment">
          {bottomSlot}
        </div>
      ) : null}

      <AppDownloadBanner className="lg:-mt-[var(--app-download-bar)]" />
      </div>
      <Footer onContactClick={onContactClick} />
    </div>
  )
}
