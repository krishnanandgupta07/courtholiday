import type { Holiday } from '../types/api'
import { formatLongDate } from '../utils/calendar'

interface DateWiseViewProps {
  selectedDate: string
  loadedDate: string | null
  holidays: Holiday[]
  loading: boolean
  error: string | null
  hasLoaded: boolean
  onDateChange: (date: string) => void
  onRetry: () => void
}

const inputClass =
  'min-h-9 rounded-sm border border-brassLight/70 bg-parchment px-2.5 py-1.5 font-body text-sm text-ink shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass'

export function DateWiseView({
  selectedDate,
  loadedDate,
  holidays,
  loading,
  error,
  hasLoaded,
  onDateChange,
  onRetry,
}: DateWiseViewProps) {
  const displayDate = loadedDate ?? selectedDate

  return (
    <section
      aria-label="Date-wise court holidays"
      className="flex w-full flex-col border border-brassLight/60 bg-parchment/80 shadow-slip"
    >
      <header className="flex shrink-0 flex-wrap items-end gap-2 border-b border-brassLight/50 bg-navy px-3 py-2 text-parchment">
        <label className="block">
          <span className="mb-0.5 block font-mono text-[9px] uppercase tracking-[0.14em] text-brassLight">
            Holiday date
          </span>
          <input
            type="date"
            className={inputClass}
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            disabled={loading}
          />
        </label>
        <div className="min-w-0 flex-1 sm:ml-2">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-brassLight">
            Courts on holiday
          </p>
          <p className="truncate font-display text-base leading-tight md:text-lg">
            {displayDate ? formatLongDate(displayDate) : 'Select a date'}
          </p>
        </div>
        <p className="font-mono text-sm text-brassLight">
          {loading ? '…' : `${holidays.length} entr${holidays.length === 1 ? 'y' : 'ies'}`}
        </p>
      </header>

      <div className="overflow-auto p-2 md:p-3">
        {loading && (
          <div
            className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            aria-busy="true"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-14 animate-pulse border border-brassLight/40 bg-parchmentDim/70"
              />
            ))}
          </div>
        )}

        {!loading && error && (
          <div
            role="alert"
            className="flex flex-1 flex-col items-center justify-center border border-burgundy/30 bg-burgundyDim px-4 py-4 text-center"
          >
            <p className="font-body text-sm text-burgundy">{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-2 min-h-9 rounded-sm border border-burgundy/40 bg-parchment px-3 py-1.5 font-body text-sm text-burgundy"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && !hasLoaded && (
          <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
            <p className="font-display text-lg text-navy">Pick a date to begin</p>
            <p className="mt-1 font-body text-sm text-inkSoft">
              All courts observing a holiday on that date will appear here.
            </p>
          </div>
        )}

        {!loading && !error && hasLoaded && holidays.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
            <p className="font-display text-lg text-navy">No holidays found</p>
            <p className="mt-1 font-body text-sm text-inkSoft">
              No court reported a holiday on this date.
            </p>
          </div>
        )}

        {!loading && !error && holidays.length > 0 && (
          <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {holidays.map((holiday, index) => (
              <li
                key={`${holiday.id}-${holiday.benchId ?? index}`}
                className="flex min-h-0 flex-col border border-brassLight/50 bg-parchment px-2 py-1.5"
              >
                <span className="font-mono text-[10px] text-inkSoft">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p
                  className="mt-0.5 line-clamp-2 font-body text-xs font-semibold leading-tight text-navy"
                  title={holiday.courtName ?? undefined}
                >
                  {holiday.courtName ?? '—'}
                </p>
                <p
                  className="line-clamp-1 font-body text-[11px] text-inkSoft"
                  title={holiday.benchName ?? undefined}
                >
                  {holiday.benchName ?? '—'}
                </p>
                <p
                  className="mt-0.5 line-clamp-2 font-body text-[11px] leading-tight text-ink"
                  title={holiday.name}
                >
                  {holiday.name}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
