import { useEffect, useMemo, useRef } from 'react'
import type { Holiday, ViewScope } from '../types/api'
import {
  formatLongDate,
  formatMonthShort,
  formatMonthYear,
  getMonthListScrollAnchor,
  todayKey,
} from '../utils/calendar'
import { DocketSlip } from './DocketSlip'

interface DocketListProps {
  holidays: Holiday[]
  loading: boolean
  error: string | null
  hasLoaded: boolean
  year: number | null
  viewMonth: number
  viewScope: ViewScope
  selectedDate?: string | null
  courtName?: string | null
  benchName?: string | null
  onRetry: () => void
}

function SkeletonSlips() {
  return (
    <div className="relative min-h-[12rem]" aria-busy="true" aria-label="Loading holiday list">
      <ul className="space-y-1" aria-hidden>
        {Array.from({ length: 6 }).map((_, i) => (
          <li
            key={i}
            className="h-11 animate-pulse border border-brassLight/40 bg-brassLight/25"
          />
        ))}
      </ul>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <p className="rounded-sm border border-brassLight/50 bg-parchment/95 px-3 py-1.5 font-body text-sm font-semibold text-navy shadow-slip">
          Loading…
        </p>
      </div>
    </div>
  )
}

export function DocketList({
  holidays,
  loading,
  error,
  hasLoaded,
  year,
  viewMonth,
  viewScope,
  selectedDate,
  courtName,
  benchName,
  onRetry,
}: DocketListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isDateView = viewScope === 'date'
  const isMonthView = viewScope === 'month'
  const today = todayKey()
  const now = new Date()
  const isCurrentMonth =
    year === now.getFullYear() && viewMonth === now.getMonth()

  const heading = isDateView
    ? selectedDate
      ? formatLongDate(selectedDate)
      : '—'
    : year == null
      ? '—'
      : viewScope === 'month'
        ? formatMonthYear(year, viewMonth)
        : String(year)

  const monthShortLabel =
    year != null && isMonthView ? formatMonthShort(year, viewMonth) : null

  const courtBenchLabel = [courtName, benchName].filter(Boolean).join(' · ')

  const scopeLabel = isDateView
    ? 'date'
    : viewScope === 'month'
      ? 'month'
      : 'year'

  const emptyHint = isDateView
    ? 'No court holidays were returned for this date.'
    : viewScope === 'month'
      ? 'No entries for this month. Try another month or switch to yearly view.'
      : 'The registry returned no entries for this year.'

  const idleHint = isDateView
    ? 'Choose a date and press View Holidays to list courts observing a holiday.'
    : 'Calendar is loading — the docket will populate shortly.'

  /** Chronological list — one row per holiday date (industry-standard docket). */
  const orderedHolidays = useMemo(
    () => [...holidays].sort((a, b) => a.date.localeCompare(b.date)),
    [holidays],
  )

  useEffect(() => {
    if (!isMonthView || !hasLoaded || loading || holidays.length === 0) return
    if (year == null) return

    const anchorDate = getMonthListScrollAnchor(holidays, year, viewMonth)
    if (!anchorDate) return

    const frame = requestAnimationFrame(() => {
      const container = scrollRef.current
      const target = container?.querySelector<HTMLElement>(
        `[data-holiday-date="${anchorDate}"]`,
      )
      if (!container || !target) return

      const top =
        target.getBoundingClientRect().top -
        container.getBoundingClientRect().top +
        container.scrollTop
      container.scrollTop = Math.max(0, top)
    })

    return () => cancelAnimationFrame(frame)
  }, [holidays, hasLoaded, isMonthView, loading, viewMonth, year])

  return (
    <section
      aria-label={isDateView ? 'Date-wise court holiday list' : 'Holiday docket list'}
      className="flex h-full min-h-[16rem] flex-col border border-brassLight/60 bg-parchment/80 shadow-slip sm:min-h-[20rem] lg:min-h-0"
    >
      <header className="flex shrink-0 items-start justify-between gap-2 border-b border-brassLight/50 bg-navy px-3 py-2 text-parchment">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-brassLight">
            {isMonthView && monthShortLabel
              ? `Holiday list · ${monthShortLabel}`
              : `Holiday list · ${scopeLabel}`}
          </p>
          {isDateView && selectedDate && (
            <p className="mt-0.5 font-body text-xs text-parchment/75">{heading}</p>
          )}
        </div>
        <div className="min-w-0 text-right">
          {isMonthView && courtBenchLabel ? (
            <p
              className="max-w-[11rem] truncate font-body text-[11px] leading-snug text-parchment sm:max-w-[14rem] sm:text-xs"
              title={courtBenchLabel}
            >
              {courtBenchLabel}
            </p>
          ) : (
            <p className="font-mono text-sm text-brassLight">
              {loading
                ? '…'
                : `${holidays.length} entr${holidays.length === 1 ? 'y' : 'ies'}`}
            </p>
          )}
        </div>
      </header>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto p-1.5 md:p-2"
      >
        {loading && <SkeletonSlips />}

        {!loading && error && (
          <div
            role="alert"
            className="flex flex-1 flex-col items-center justify-center border border-burgundy/30 bg-burgundyDim px-4 py-5 text-center"
          >
            <p className="font-body text-sm text-burgundy">{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 min-h-10 rounded-sm border border-burgundy/40 bg-parchment px-4 py-2 font-body text-sm text-burgundy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && !hasLoaded && (
          <div className="px-4 py-8 text-center">
            <p className="font-display text-xl text-navy">
              {isDateView ? 'No date loaded' : 'No calendar loaded'}
            </p>
            <p className="mt-2 max-w-xs font-body text-sm text-inkSoft">
              {idleHint}
            </p>
          </div>
        )}

        {!loading && !error && hasLoaded && holidays.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="font-display text-lg text-navy">No holidays found</p>
            <p className="mt-1 font-body text-sm text-inkSoft">{emptyHint}</p>
          </div>
        )}

        {!loading && !error && orderedHolidays.length > 0 && (
          <ul className="space-y-1">
            {orderedHolidays.map((holiday, index) => {
              const isToday = holiday.date === today
              const highlighted =
                isToday ||
                (isMonthView && isCurrentMonth && holiday.date > today)

              return (
                <li
                  key={`${holiday.id}-${holiday.benchId ?? index}-${holiday.date}`}
                  data-holiday-date={holiday.date}
                >
                  <DocketSlip holiday={holiday} highlighted={highlighted} />
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
