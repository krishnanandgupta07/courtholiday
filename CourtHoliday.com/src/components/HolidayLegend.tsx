/** Shared holiday colour key for the calendar, list, and legend. */

export const HOLIDAY_LEGEND = [
  {
    type: 'gazetted' as const,
    label: 'Public holiday',
    swatchClass: 'bg-[#B42318]',
  },
  {
    type: 'restricted' as const,
    label: 'Sunday / Saturday',
    swatchClass: 'bg-[#9A6B2F]',
  },
]

interface HolidayLegendProps {
  /** Light text for navy headers */
  onDark?: boolean
}

export function HolidayLegend({ onDark = false }: HolidayLegendProps) {
  return (
    <ul
      aria-label="Holiday colour key"
      className={`flex flex-wrap items-center gap-x-3 gap-y-0.5 font-body text-[10px] leading-none sm:text-[11px] ${
        onDark ? 'text-parchment/90' : 'text-inkSoft'
      }`}
    >
      {HOLIDAY_LEGEND.map((item) => (
        <li key={item.type} className="inline-flex items-center gap-1.5">
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-sm border border-black/10 ${item.swatchClass}`}
            aria-hidden
          />
          {item.label}
        </li>
      ))}
    </ul>
  )
}
