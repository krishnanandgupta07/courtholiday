/**
 * Scrolling disclaimer under the header — replaces the visible Home breadcrumbs strip.
 * Fetches the official holiday calendar PDF for the selected bench and year.
 */
import { useEffect, useState } from 'react'
import {
  fetchHolidayCalendarLink,
  resolveHolidayCalendarPdfUrl,
} from '../api/client'

interface DisclaimerMarqueeProps {
  benchId: number | null
  courtName?: string | null
  year: number
}

export function DisclaimerMarquee({
  benchId,
  courtName,
  year,
}: DisclaimerMarqueeProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  useEffect(() => {
    if (benchId == null) {
      setPdfUrl(null)
      return
    }

    let cancelled = false
    setPdfUrl(null)

    void (async () => {
      try {
        const data = await fetchHolidayCalendarLink(benchId)
        if (cancelled) return
        setPdfUrl(resolveHolidayCalendarPdfUrl(data, year))
      } catch {
        if (!cancelled) setPdfUrl(null)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [benchId, year])

  const courtLabel = courtName?.trim() || 'the selected court'

  return (
    <aside
      aria-label="Disclaimer"
      className="shrink-0 overflow-hidden border-b border-brassLight/30 bg-navyDeep/95 text-parchment"
    >
      <div className="disclaimer-marquee-track flex w-max items-center gap-10 whitespace-nowrap py-1.5 pl-[100%] font-body text-[11px] leading-snug sm:text-xs">
        <DisclaimerCopy
          courtLabel={courtLabel}
          year={year}
          pdfUrl={pdfUrl}
        />
        {/* Duplicate for seamless loop */}
        <DisclaimerCopy
          courtLabel={courtLabel}
          year={year}
          pdfUrl={pdfUrl}
          ariaHidden
        />
      </div>
    </aside>
  )
}

function DisclaimerCopy({
  courtLabel,
  year,
  pdfUrl,
  ariaHidden,
}: {
  courtLabel: string
  year: number
  pdfUrl: string | null
  ariaHidden?: boolean
}) {
  return (
    <p
      className="inline-flex items-center gap-1.5 px-2"
      aria-hidden={ariaHidden || undefined}
    >
      <span className="font-semibold uppercase tracking-[0.12em] text-brassLight">
        Disclaimer:
      </span>
      <span className="text-parchment/90">
        Holiday dates for {courtLabel} ({year}) are compiled for quick
        reference only. Always verify with the official court holiday calendar
        before relying on these dates.
      </span>
      {pdfUrl ? (
        <>
          <span className="text-parchment/50" aria-hidden>
            —
          </span>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={ariaHidden ? -1 : undefined}
            className="font-semibold text-brassLight underline-offset-2 transition hover:text-brass hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
          >
            View official holiday calendar PDF
          </a>
        </>
      ) : null}
    </p>
  )
}
