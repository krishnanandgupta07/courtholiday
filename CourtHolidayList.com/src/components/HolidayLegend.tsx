/** Compact colour key — public holidays (red) vs Sunday / Saturday (gold). */
export function HolidayLegend() {
  return (
    <div
      className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-0.5 border-t border-brassLight/40 bg-parchment/90 px-2 py-1 font-body text-[10px] leading-none text-inkSoft sm:text-[11px]"
      aria-label="Holiday colour legend"
    >
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
        <span
          className="inline-block h-2.5 w-2.5 shrink-0 bg-holidayPublic"
          aria-hidden
        />
        Public holiday
      </span>
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
        <span
          className="inline-block h-2.5 w-2.5 shrink-0 bg-holidayWeekend"
          aria-hidden
        />
        Sunday / Saturday
      </span>
    </div>
  )
}
