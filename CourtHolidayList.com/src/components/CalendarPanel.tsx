import { useMemo } from 'react'
import type { Holiday, ViewScope } from '../types/api'
import {
  WEEKDAYS,
  buildHolidayMap,
  buildMonthGrid,
  formatMonthName,
  formatMonthYear,
} from '../utils/calendar'

interface CalendarPanelProps {
  holidays: Holiday[]
  year: number
  viewMonth: number
  viewScope: Extract<ViewScope, 'month' | 'year'>
  loading: boolean
  error: string | null
  hasLoaded: boolean
  onRetry: () => void
  onViewMonthChange: (month: number) => void
  onSelectMonthFromYear?: (month: number) => void
  onSelectDate?: (date: string) => void
}

const navBtn =
  'inline-flex min-h-9 min-w-9 items-center justify-center rounded-sm border border-brassLight/70 bg-parchment px-2.5 font-body text-sm text-navy transition hover:bg-parchmentDim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-parchment disabled:opacity-40 sm:min-h-10 sm:min-w-10 sm:px-3'

function MonthDayGrid({
  year,
  month,
  holidayMap,
  compact = false,
  yearView = false,
  onSelectDate,
}: {
  year: number
  month: number
  holidayMap: Map<string, Holiday[]>
  compact?: boolean
  yearView?: boolean
  onSelectDate?: (date: string) => void
}) {
  const cells = buildMonthGrid(year, month, holidayMap)
  const isYearCompact = yearView || compact

  return (
    <>
      <div
        className={`mb-0.5 grid grid-cols-7 ${
          yearView ? 'gap-px' : compact ? 'gap-px' : 'gap-1.5 md:gap-2'
        }`}
      >
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className={`text-center font-mono uppercase tracking-wider text-inkSoft ${
              yearView
                ? 'py-0 text-[8px] leading-none'
                : compact
                  ? 'py-0 text-[7px] leading-none'
                  : 'py-1 text-[10px] md:text-xs'
            }`}
          >
            {isYearCompact ? day.charAt(0) : day}
          </div>
        ))}
      </div>

      <div
        className={`grid grid-cols-7 ${
          yearView ? 'gap-px' : compact ? 'gap-px' : 'gap-1.5 md:gap-2'
        }`}
        role="grid"
        aria-label={`Calendar for ${formatMonthYear(year, month)}`}
      >
        {cells.map((cell) => {
          if (!cell.inMonth) {
            return (
              <div
                key={cell.key}
                className={
                  yearView
                    ? 'min-h-[0.9rem]'
                    : compact
                      ? 'min-h-[0.85rem]'
                      : 'min-h-[2.75rem] md:min-h-[3rem]'
                }
                aria-hidden
              />
            )
          }

          const primary = cell.holidays[0]
          const isGazetted = primary?.type === 'gazetted'
          const isRestricted = primary?.type === 'restricted'
          const title = cell.holidays.map((h) => h.name).join(', ')

          const hasHoliday = cell.holidays.length > 0
          const isClickable = Boolean(onSelectDate && hasHoliday && !isYearCompact)

          return (
            <div
              key={cell.key}
              role={isClickable ? 'button' : 'gridcell'}
              title={hasHoliday ? title : undefined}
              aria-label={
                hasHoliday
                  ? `${cell.day} ${formatMonthYear(year, month)}, ${title}`
                  : undefined
              }
              tabIndex={isClickable ? 0 : hasHoliday && !isYearCompact ? 0 : undefined}
              onClick={
                isClickable
                  ? () => onSelectDate?.(cell.key)
                  : undefined
              }
              onKeyDown={
                isClickable
                  ? (event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        onSelectDate?.(cell.key)
                      }
                    }
                  : undefined
              }
              className={[
                'group/day relative flex flex-col border',
                yearView
                  ? 'min-h-[0.9rem] items-center justify-center p-0'
                  : compact
                    ? 'min-h-[0.85rem] items-center justify-center p-0'
                    : 'min-h-[3.25rem] p-0.5 sm:min-h-[2.75rem] sm:p-1 md:min-h-[3rem] md:p-1',
                cell.isToday
                  ? 'border-sage ring-1 ring-sage/40 md:ring-2'
                  : 'border-brassLight/40',
                yearView
                  ? hasHoliday
                    ? 'bg-parchment hover:bg-burgundyDim/90'
                    : 'bg-parchment'
                  : isGazetted
                    ? 'bg-burgundyDim/80'
                    : isRestricted
                      ? 'bg-brassLight/35'
                      : 'bg-parchment',
                isClickable
                  ? 'cursor-pointer transition hover:border-brass hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass'
                  : hasHoliday && !isYearCompact
                    ? 'cursor-help'
                    : yearView && hasHoliday
                      ? 'cursor-help'
                      : '',
              ].join(' ')}
            >
              <span
                className={[
                  'font-mono',
                  yearView
                    ? 'text-[9px] leading-none'
                    : compact
                      ? 'text-[7px] leading-none'
                      : 'text-[11px] sm:text-xs md:text-sm',
                  cell.isToday
                    ? 'font-bold text-sage'
                    : yearView
                      ? hasHoliday
                        ? 'text-burgundy'
                        : 'text-ink'
                      : isGazetted
                        ? 'text-burgundy'
                        : 'text-ink',
                ].join(' ')}
              >
                {cell.day}
              </span>
              {hasHoliday && yearView && (
                <span
                  className="mt-px h-0.5 w-0.5 rounded-full bg-burgundy/70"
                  aria-hidden
                />
              )}
              {!isYearCompact && primary && (
                <span
                  className={[
                    'mt-0.5 line-clamp-2 text-[8px] leading-tight font-body sm:text-[9px] md:mt-1 md:text-[10px]',
                    isGazetted ? 'text-burgundy' : 'text-[#6F5630]',
                  ].join(' ')}
                >
                  {primary.name}
                </span>
              )}
              {!isYearCompact && cell.holidays.length > 1 && (
                <span className="mt-auto font-mono text-[8px] text-inkSoft sm:text-[9px]">
                  +{cell.holidays.length - 1}
                </span>
              )}
              {/* Hover / focus tip — reliable on small desktop viewports (native title is often delayed/hidden) */}
              {!isYearCompact && hasHoliday ? (
                <span
                  role="tooltip"
                  className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 hidden w-max max-w-[11rem] -translate-x-1/2 rounded-sm border border-brassLight/50 bg-navyDeep px-2 py-1 text-left font-body text-[10px] leading-snug text-parchment shadow-slip group-hover/day:block group-focus-within/day:block"
                >
                  {title}
                </span>
              ) : null}
            </div>
          )
        })}
      </div>
    </>
  )
}

export function CalendarPanel({
  holidays,
  year,
  viewMonth,
  viewScope,
  loading,
  error,
  hasLoaded,
  onRetry,
  onViewMonthChange,
  onSelectMonthFromYear,
  onSelectDate,
}: CalendarPanelProps) {
  const holidayMap = useMemo(() => buildHolidayMap(holidays), [holidays])
  const atYearStart = viewMonth === 0
  const atYearEnd = viewMonth === 11
  const todayInLoadedYear = new Date().getFullYear() === year

  const goPrev = () => {
    if (atYearStart) return
    onViewMonthChange(viewMonth - 1)
  }

  const goNext = () => {
    if (atYearEnd) return
    onViewMonthChange(viewMonth + 1)
  }

  const goToday = () => {
    if (!todayInLoadedYear) {
      onViewMonthChange(0)
      return
    }
    onViewMonthChange(new Date().getMonth())
  }

  const title =
    viewScope === 'year'
      ? `Year ${year}`
      : formatMonthYear(year, viewMonth)

  return (
    <section
      aria-label="Holiday calendar"
      className="flex h-full min-h-[20rem] flex-col border border-brassLight/60 bg-parchment/80 shadow-slip sm:min-h-[24rem] lg:min-h-0"
    >
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-brassLight/50 bg-navy px-2.5 py-1 text-parchment">
        <div>
          <h2 className="font-display text-sm leading-tight md:text-base">{title}</h2>
        </div>
        {viewScope === 'month' && (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              className={navBtn}
              onClick={goPrev}
              disabled={atYearStart}
              aria-label="Previous month"
            >
              ‹
            </button>
            <button type="button" className={navBtn} onClick={goToday}>
              Today
            </button>
            <button
              type="button"
              className={navBtn}
              onClick={goNext}
              disabled={atYearEnd}
              aria-label="Next month"
            >
              ›
            </button>
          </div>
        )}
      </header>

      <div
        className={
          viewScope === 'year'
            ? 'min-h-0 flex-1 overflow-auto p-1 lg:overflow-hidden'
            : 'min-h-0 flex-1 overflow-auto p-1.5 md:p-2'
        }
      >
        {loading && (
          <div
            className="grid grid-cols-7 gap-1.5 md:gap-2"
            aria-busy="true"
            aria-label="Loading calendar"
          >
            {Array.from({ length: 35 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse bg-parchmentDim/80 md:min-h-[3.5rem]"
              />
            ))}
          </div>
        )}

        {!loading && error && (
          <div
            role="alert"
            className="flex flex-col items-center justify-center border border-burgundy/30 bg-burgundyDim px-4 py-8 text-center"
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
          <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
            <p className="font-display text-xl text-navy">Awaiting selection</p>
            <p className="mt-2 max-w-sm font-body text-sm text-inkSoft">
              The calendar will appear once a court, bench, and year are selected.
            </p>
          </div>
        )}

        {!loading && !error && hasLoaded && viewScope === 'month' && (
          <MonthDayGrid
            year={year}
            month={viewMonth}
            holidayMap={holidayMap}
            onSelectDate={onSelectDate}
          />
        )}

        {!loading && !error && hasLoaded && viewScope === 'year' && (
          <div className="grid h-full grid-cols-2 gap-1 sm:grid-cols-4 sm:gap-1.5">
            {Array.from({ length: 12 }, (_, month) => (
              <button
                key={month}
                type="button"
                onClick={() => onSelectMonthFromYear?.(month)}
                className="flex min-h-0 flex-col border border-brassLight/50 bg-parchment p-1 text-left transition hover:border-brass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
                aria-label={`Open ${formatMonthName(month)} ${year}`}
              >
                <p className="mb-0.5 shrink-0 font-display text-[11px] leading-tight text-navy sm:text-xs">
                  {formatMonthName(month)}
                </p>
                <MonthDayGrid
                  year={year}
                  month={month}
                  holidayMap={holidayMap}
                  yearView
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
