import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CourtCategory, ViewScope } from '../types/api'
import {
  defaultViewMonth,
  filterHolidaysByMonth,
} from '../utils/calendar'
import { filterCourtsByCategory, filterHolidayCourtName } from '../utils/courtCategory'
import { AppHeader } from './AppHeader'
import { CalendarPanel } from './CalendarPanel'
import { DateWiseView } from './DateWiseView'
import { DocketList } from './DocketList'
import { Footer } from './Footer'
import { SelectorBar } from './SelectorBar'
import { ViewScopeBar } from './ViewScopeBar'
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

export function CourtHolidayCalendar({
  onContactClick,
  onHomeClick,
}: {
  onContactClick?: () => void
  onHomeClick?: () => void
}) {
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

  const [courtCategory, setCourtCategory] =
    useState<CourtCategory>('high-court')
  const [viewScope, setViewScope] = useState<ViewScope>('month')
  
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
  /** True for HC + SC — no submit button, auto-loads on selection */
  const isAutoLoad = AUTO_LOAD_CATEGORIES.includes(courtCategory)

  // ── Auto-select default court + bench when courts load / category changes ──
  const autoSelectedRef = useRef<string>('')

  const applyAutoDefault = useCallback(() => {
    if (!isAutoLoad || courtsState.loading || courts.length === 0) return

    let targetCourt = ''
    if (courtCategory === 'high-court') {
      targetCourt = HC_DEFAULT_COURT
    } else if (courtCategory === 'supreme-court') {
      targetCourt = SC_DEFAULT_COURT
    }

    // Find matching court (case-insensitive partial match)
    const allCategoryCourts = filterCourtsByCategory(courts, courtCategory)
    const matchedCourt =
      allCategoryCourts.find((c) =>
        c.courtName.toLowerCase().includes(targetCourt.toLowerCase()),
      ) ?? allCategoryCourts[0]

    if (!matchedCourt) return

    const autoKey = `${courtCategory}:${matchedCourt.courtName}`
    if (autoSelectedRef.current === autoKey && selectedCourt === matchedCourt.courtName) {
      return
    }

    selectCourt(matchedCourt.courtName)
    autoSelectedRef.current = autoKey
  }, [
    courtCategory,
    courts,
    courtsState.loading,
    isAutoLoad,
    selectCourt,
    selectedCourt,
  ])

  // Apply auto-default whenever courts load or category changes
  useEffect(() => {
    applyAutoDefault()
  }, [applyAutoDefault])

  // ── Auto-select bench once court is set and benches are available ──
  const benchAutoAppliedRef = useRef<string>('')

  useEffect(() => {
    if (!isAutoLoad || !selectedCourt || benches.length === 0) return

    // Always pick a default when no bench is selected (covers court re-select)
    if (selectedBenchId != null) {
      const stillValid = benches.some((b) => b.id === selectedBenchId)
      if (stillValid) {
        benchAutoAppliedRef.current = `${selectedCourt}:${courtCategory}`
        return
      }
    }

    let targetBench = benches[0]
    if (courtCategory === 'high-court') {
      const found = benches.find((b) =>
        b.name.toLowerCase().includes(HC_DEFAULT_BENCH.toLowerCase()),
      )
      if (found) targetBench = found
    }

    setSelectedBenchId(targetBench.id)
    benchAutoAppliedRef.current = `${selectedCourt}:${courtCategory}`
  }, [
    benches,
    courtCategory,
    isAutoLoad,
    selectedBenchId,
    selectedCourt,
    setSelectedBenchId,
  ])

  // ── Auto-load holidays once bench is selected (for auto categories) ──
  const autoLoadedKeyRef = useRef<string>('')
  const dateLoadedKeyRef = useRef<string>('')

  useEffect(() => {
    // Don't run bench auto-load in date view — date-wise load takes over
    if (!isAutoLoad || isDateView || selectedBenchId == null || !selectedCourt) {
      return
    }
    const loadKey = `${selectedBenchId}:${selectedYear}`
    if (autoLoadedKeyRef.current === loadKey) return
    autoLoadedKeyRef.current = loadKey
    void loadHolidays()
  }, [
    isAutoLoad,
    isDateView,
    loadHolidays,
    selectedBenchId,
    selectedCourt,
    selectedYear,
  ])

  const handleCourtChange = (courtName: string) => {
    if (courtName === selectedCourt) return
    benchAutoAppliedRef.current = ''
    autoLoadedKeyRef.current = ''
    selectCourt(courtName)
    if (isAutoLoad) clearHolidayResults()
  }

  const handleBenchChange = (benchId: number | null) => {
    if (benchId === selectedBenchId) return
    autoLoadedKeyRef.current = ''
    setSelectedBenchId(benchId)
    if (isAutoLoad) clearHolidayResults()
  }

  const handleCourtCategoryChange = (category: CourtCategory) => {
    if (category === courtCategory) return
    // Reset auto-selection refs so defaults re-apply for new category
    autoSelectedRef.current = ''
    benchAutoAppliedRef.current = ''
    autoLoadedKeyRef.current = ''
    setCourtCategory(category)
    selectCourt('')
    setSelectedBenchId(null)
    // Date-wise API returns all courts — keep loaded data and re-filter by category
    if (!isDateView) {
      clearHolidayResults()
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
      clearHolidayResults()
      setViewScope('date')
    }
  }

  // When year changes in an auto-load category, allow reload for new year
  const handleYearChange = (year: number) => {
    setSelectedYear(year)
    if (isAutoLoad) {
      autoLoadedKeyRef.current = '' // allow bench reload for new year
    }
  }

  const handleViewScopeChange = (scope: ViewScope) => {
    if (scope === 'summary') return
    if (scope === viewScope) return

    const leavingDate = viewScope === 'date'
    const enteringDate = scope === 'date'

    // Month ↔ Year share the same holiday payload — keep it.
    // Date view uses a different API, so clear when crossing that boundary.
    if (leavingDate || enteringDate) {
      clearHolidayResults()
      if (leavingDate) {
        // Force bench calendar reload when returning from date-wise
        autoLoadedKeyRef.current = ''
      }
      if (enteringDate) {
        dateLoadedKeyRef.current = ''
      }
    }

    setViewScope(scope)
  }

  // ── Auto-load date-wise holidays on tab open and date change ──
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

  const categoryLabel = courtCategory.replace(/-/g, ' ')

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-parchment bg-parchment-grid bg-grid text-ink">
      <AppHeader
        courtCategory={courtCategory}
        onCourtCategoryChange={handleCourtCategoryChange}
        onHomeClick={onHomeClick}
      />
      <ViewScopeBar
        value={viewScope}
        onChange={handleViewScopeChange}
      />

      <main
        className={
          isYearView
            ? 'flex min-h-0 w-full flex-1 flex-col overflow-hidden px-3 py-1.5 sm:px-4 md:px-6 lg:px-8'
            : 'w-full flex-1 overflow-y-auto px-3 py-2 sm:px-4 sm:py-3 md:px-6 lg:px-8'
        }
      >
        {isDateView ? (
          <DateWiseView
            selectedDate={selectedDate}
            loadedDate={loadedDate}
            holidays={visibleHolidays}
            loading={holidaysState.loading}
            error={holidaysState.error}
            hasLoaded={hasLoadedHolidays}
            onDateChange={handleDateChange}
            onRetry={() => {
              dateLoadedKeyRef.current = ''
              retryHolidaysByDate()
            }}
          />
        ) : (
          <>
            {courtsState.error && isBenchView && (
              <div
                role="alert"
                className="mb-3 flex flex-wrap items-center justify-between gap-3 border border-burgundy/30 bg-burgundyDim px-4 py-3"
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

            {!courtsState.loading &&
              isBenchView &&
              filteredCourts.length === 0 && (
                <div className="mb-3 border border-brassLight/50 bg-parchmentDim/60 px-4 py-3 font-body text-sm text-inkSoft">
                  No {categoryLabel} Holidays are available. We are working on it.
                  Try High Court or Supreme Court. We will update the holidays as soon as possible.
                </div>
              )}

            <div
              className={[
                'grid w-full min-h-0 gap-2 items-stretch',
                isYearView && showSidebar
                  ? 'h-full grid-cols-1 lg:grid-cols-[minmax(11rem,12rem)_minmax(0,1fr)]'
                  : showSidebar && showDocketList
                    ? 'grid-cols-1 lg:grid-cols-[minmax(12rem,14rem)_minmax(0,1.4fr)_minmax(16rem,1fr)]'
                    : showSidebar
                      ? 'grid-cols-1 lg:grid-cols-[minmax(12rem,14rem)_minmax(0,1fr)]'
                      : showDocketList
                        ? 'grid-cols-1 md:grid-cols-2'
                        : 'grid-cols-1',
              ].join(' ')}
            >
              {courtsState.loading && isBenchView && !courtsState.error && (
                <div
                  className="h-40 animate-pulse border border-brassLight/40 bg-parchmentDim/60 lg:h-auto lg:min-h-[12rem]"
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
                  holidaysLoading={holidaysState.loading}
                  onCourtChange={handleCourtChange}
                  onBenchChange={handleBenchChange}
                  onYearChange={handleYearChange}
                  onDateChange={setSelectedDate}
                  onSubmit={() => void loadHolidays()}
                />
              )}

              <div
                className={`flex min-w-0 flex-col ${isYearView ? 'h-full min-h-0' : ''}`}
              >
                <CalendarPanel
                  holidays={holidays}
                  year={calendarYear}
                  viewMonth={viewMonth}
                  viewScope={isYearView ? 'year' : 'month'}
                  loading={holidaysState.loading}
                  error={holidaysState.error}
                  hasLoaded={hasLoadedHolidays}
                  onRetry={retryHolidays}
                  onViewMonthChange={setViewMonth}
                  onSelectMonthFromYear={openMonthFromYearView}
                  onSelectDate={openDateView}
                />
              </div>

              {showDocketList && (
                <div className="flex min-w-0 flex-col">
                  <DocketList
                    holidays={visibleHolidays}
                    loading={holidaysState.loading}
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
          </>
        )}
      </main>

      <Footer onContactClick={onContactClick} />
    </div>
  )
}
