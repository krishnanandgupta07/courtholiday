import type { Holiday } from '../types/api'

interface DocketSlipProps {
  holiday: Holiday
  highlighted?: boolean
}

/** One holiday row: date block (month · day · weekday) + holiday name. */
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
          ? 'border-navy/40 ring-1 ring-navy/20'
          : 'border-brassLight/50'
      }`}
      aria-label={`${holiday.name}, ${holiday.date}`}
    >
      <div
        className={`flex w-11 shrink-0 flex-col items-center justify-center border-r border-dashed pr-2 ${
          isGazetted
            ? 'border-holidayPublic/40 text-holidayPublic'
            : 'border-holidayWeekend/50 text-holidayWeekend'
        }`}
      >
        <span className="font-mono text-[9px] uppercase tracking-wide">
          {monthShort}
        </span>
        <span className="font-mono text-lg font-semibold leading-none">
          {String(dayNum).padStart(2, '0')}
        </span>
        <span className="font-mono text-[9px]">
          {holiday.day.slice(0, 3)}
        </span>
      </div>

      <h3 className="min-w-0 flex-1 font-body text-sm font-medium leading-snug text-ink">
        {holiday.name}
      </h3>
    </article>
  )
}
