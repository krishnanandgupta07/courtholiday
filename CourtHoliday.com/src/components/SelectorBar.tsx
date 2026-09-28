interface SelectorBarProps {
  courts: { courtName: string }[]
  benches: { id: number; name: string; benchType: string | null }[]
  years: number[]
  selectedCourt: string
  selectedBenchId: number | null
  selectedYear: number
  selectedDate: string
  mode: 'bench' | 'date'
  /** When true, hides court/bench pickers — shows only Year (Supreme Court only) */
  isAutoCategory?: boolean
  /** When true, hides the View Calendar submit button (HC + SC) */
  hideSubmitButton?: boolean
  courtsLoading: boolean
  holidaysLoading: boolean
  onCourtChange: (courtName: string) => void
  onBenchChange: (benchId: number | null) => void
  onYearChange: (year: number) => void
  onDateChange: (date: string) => void
  onSubmit: () => void
  /** Opens the India-map court picker (High Court / District). */
  onOpenMap?: () => void
  showMapButton?: boolean
}

const selectClass =
  'w-full min-h-9 rounded-sm border border-brassLight/70 bg-parchment px-2.5 py-1.5 font-body text-sm text-ink shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-parchment disabled:cursor-not-allowed disabled:opacity-55'

const submitBtnClass =
  'inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-sm bg-navy px-3 py-1.5 font-body text-sm font-semibold tracking-wide text-parchment transition hover:bg-navyDeep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-parchment disabled:cursor-not-allowed disabled:opacity-50'

export function SelectorBar({
  courts,
  benches,
  years,
  selectedCourt,
  selectedBenchId,
  selectedYear,
  selectedDate,
  mode,
  isAutoCategory = false,
  hideSubmitButton = false,
  courtsLoading,
  holidaysLoading,
  onCourtChange,
  onBenchChange,
  onYearChange,
  onDateChange,
  onSubmit,
  onOpenMap,
  showMapButton = false,
}: SelectorBarProps) {
  const canSubmitBench =
    Boolean(selectedCourt) && selectedBenchId != null && !holidaysLoading
  const canSubmitDate = Boolean(selectedDate) && !holidaysLoading

  return (
    <aside
      aria-label="Court holiday selectors"
      className="flex h-fit w-full flex-col gap-2 self-start border border-brassLight/60 bg-parchment/90 p-2 shadow-slip sm:gap-2.5 sm:p-2.5 lg:sticky lg:top-0"
    >
      {mode === 'date' ? (
        <>
          <label className="block">
            <span className="mb-1 block font-body text-[11px] font-medium uppercase tracking-wide text-inkSoft">
              Holiday date
            </span>
            <input
              type="date"
              className={selectClass}
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              disabled={holidaysLoading}
            />
          </label>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmitDate}
            className={submitBtnClass}
          >
            {holidaysLoading ? 'Loading…' : 'View Holidays'}
          </button>
        </>
      ) : isAutoCategory ? (
        // Supreme Court: single court/bench — show only Year selector
        <>
          <label className="block">
            <span className="mb-1 block font-body text-[11px] font-medium uppercase tracking-wide text-inkSoft">
              Year
            </span>
            <select
              className={selectClass}
              value={selectedYear}
              onChange={(e) => onYearChange(Number(e.target.value))}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block">
                <span className="mb-1 block font-body text-[11px] font-medium uppercase tracking-wide text-inkSoft">
                  Court Name
                </span>
                <select
                  className={selectClass}
                  value={selectedCourt}
                  disabled={courtsLoading || courts.length === 0}
                  onChange={(e) => onCourtChange(e.target.value)}
                  aria-busy={courtsLoading}
                >
                  <option value="">
                    {courtsLoading ? 'Loading courts…' : 'Choose a court'}
                  </option>
                  {courts.map((court) => (
                    <option key={court.courtName} value={court.courtName}>
                      {court.courtName}
                    </option>
                  ))}
                </select>
              </label>
              {showMapButton ? (
                <button
                  type="button"
                  onClick={onOpenMap}
                  disabled={courtsLoading}
                  className="mt-1.5 inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-sm border border-brassLight/70 bg-parchment px-3 py-1.5 font-body text-sm font-semibold text-navy transition hover:border-brass hover:bg-parchmentDim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-parchment disabled:cursor-not-allowed disabled:opacity-55"
                  aria-haspopup="dialog"
                >
                  Choose on map
                </button>
              ) : null}
            </div>

            <label className="block">
              <span className="mb-1 block font-body text-[11px] font-medium uppercase tracking-wide text-inkSoft">
                Bench Name
              </span>
              <select
                className={selectClass}
                value={selectedBenchId ?? ''}
                disabled={!selectedCourt || benches.length === 0}
                onChange={(e) => {
                  const value = e.target.value
                  onBenchChange(value ? Number(value) : null)
                }}
              >
                <option value="">
                  {!selectedCourt
                    ? 'Select a court first'
                    : benches.length === 0
                      ? 'No benches available'
                      : 'Choose a bench'}
                </option>
                {benches.map((bench) => (
                  <option key={bench.id} value={bench.id}>
                    {bench.name}
                    {bench.benchType ? ` — ${bench.benchType}` : ''}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block font-body text-[11px] font-medium uppercase tracking-wide text-inkSoft">
                Year
              </span>
              <select
                className={selectClass}
                value={selectedYear}
                onChange={(e) => onYearChange(Number(e.target.value))}
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {!hideSubmitButton && (
            <button
              type="button"
              onClick={onSubmit}
              disabled={!canSubmitBench}
              className={submitBtnClass}
            >
              {holidaysLoading ? 'Loading…' : 'View Calendar'}
            </button>
          )}
        </>
      )}
    </aside>
  )
}
