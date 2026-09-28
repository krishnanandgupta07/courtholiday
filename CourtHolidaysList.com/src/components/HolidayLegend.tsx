/** Compact colour key — public holidays (red) vs Sunday / Saturday closures (gold). */
export function HolidayLegend({ className = '' }: { className?: string }) {
  return (
    <ul
      className={`flex flex-wrap items-center gap-x-3 gap-y-1 font-body text-[10px] leading-none text-inkSoft sm:text-[11px] ${className}`}
      aria-label="Holiday colours"
    >
      <li className="inline-flex items-center gap-1.5">
        <span
          className="h-2.5 w-2.5 shrink-0 bg-[#B42318]"
          aria-hidden
        />
        Public holiday
      </li>
      <li className="inline-flex items-center gap-1.5">
        <span
          className="h-2.5 w-2.5 shrink-0 bg-[#9A6B2F]"
          aria-hidden
        />
        Sunday / Saturday
      </li>
    </ul>
  )
}
