import type { Holiday } from '../types/api'

interface DocketSlipProps {
  holiday: Holiday
  highlighted?: boolean
}

/** Collapse sorted day numbers into readable ranges, e.g. [1,2,3,7] → "1-3, 7" */
export function formatHolidayDayRanges(days: number[]): string[] {
  if (days.length === 0) return []
  const ranges: string[] = []
  let start = days[0]
  let end = days[0]

  for (let i = 1; i < days.length; i += 1) {
    const value = days[i]
    if (value === end + 1) {
      end = value
      continue
    }
    ranges.push(start === end ? String(start) : `${start}-${end}`)
    start = value
    end = value
  }
  ranges.push(start === end ? String(start) : `${start}-${end}`)
  return ranges
}

interface GroupedMonthSlipProps {
  name: string
  dayNumbers: number[]
}

export function GroupedMonthSlip({ name, dayNumbers }: GroupedMonthSlipProps) {
  const ranges = formatHolidayDayRanges(dayNumbers)
  const count = dayNumbers.length

  return (
    <article
      className="flex gap-2.5 border border-brassLight/50 bg-parchment px-2.5 py-2 shadow-slip transition hover:border-brass/50"
      aria-label={`${name}, on ${ranges.join(', ')}`}
    >
      <div className="flex w-11 shrink-0 flex-col items-center justify-center rounded-sm border border-brassLight/50 bg-navy/5 py-1.5">
        <span className="font-mono text-lg font-semibold leading-none text-navy">
          {count}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-body text-sm font-semibold leading-snug text-ink">
          {name}
        </h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          <span className="shrink-0 font-body text-[11px] font-medium text-navy/75">
            On
          </span>
          {ranges.map((range) => (
            <span
              key={range}
              className="inline-flex rounded-sm border border-brassLight/70 bg-parchmentDim/90 px-1.5 py-0.5 font-mono text-[10px] text-navy"
            >
              {range}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}

export function DocketSlip({ holiday, highlighted = false }: DocketSlipProps) {
  const date = new Date(
    Number(holiday.date.slice(0, 4)),
    Number(holiday.date.slice(5, 7)) - 1,
    Number(holiday.date.slice(8, 10)),
  )
  const dayNum = date.getDate()
  const monthShort = date.toLocaleDateString('en-IN', { month: 'short' })
  const isGazetted = holiday.type === 'gazetted'

  return (
    <article
      className={`group flex items-center gap-2 border bg-parchment px-2 py-1.5 shadow-slip transition hover:border-brass/60 ${
        highlighted
          ? 'border-sage/60 ring-1 ring-sage/25'
          : 'border-brassLight/50'
      }`}
      aria-label={`${holiday.name}, ${holiday.date}`}
    >
      <div
        className={`flex w-11 shrink-0 flex-col items-center justify-center border-r border-dashed pr-2 ${
          isGazetted
            ? 'border-burgundy/40 text-burgundy'
            : 'border-brass/50 text-brass'
        }`}
      >
        <span className="font-mono text-[9px] uppercase tracking-wide text-inkSoft">
          {monthShort}
        </span>
        <span className="font-mono text-lg font-semibold leading-none">
          {String(dayNum).padStart(2, '0')}
        </span>
        <span className="font-mono text-[9px] text-inkSoft">
          {holiday.day.slice(0, 3)}
        </span>
      </div>

      <h3 className="min-w-0 flex-1 font-body text-sm font-medium leading-snug text-ink">
        {holiday.name}
      </h3>
    </article>
  )
}
