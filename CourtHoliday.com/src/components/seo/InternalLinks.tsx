/**
 * Crawlable internal links for court pages.
 * Links Supreme Court, related High Courts, District Courts, prev/next year, and state hub.
 */
import { Link } from 'react-router-dom'
import type { CourtCategory, CourtOption } from '../../types/api'
import { classifyCourtCategory } from '../../utils/courtCategory'
import {
  courtHolidayPath,
  statePath,
  stateSlugFromCourt,
  supremeCourtHubPath,
} from '../../seo/slugs'

interface InternalLinksProps {
  courtName: string
  category: CourtCategory
  year: number
  courts: CourtOption[]
  years?: number[]
}

function linkClass() {
  return 'rounded-sm text-navy underline-offset-2 transition hover:text-burgundy hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass'
}

export function InternalLinks({
  courtName,
  category,
  year,
  courts,
  years = [],
}: InternalLinksProps) {
  const stateSlug = stateSlugFromCourt(courtName)
  const relatedHighCourts = courts
    .filter((c) => classifyCourtCategory(c.courtName) === 'high-court')
    .filter((c) => c.courtName !== courtName)
    .slice(0, 8)

  const relatedDistrict = courts
    .filter((c) => classifyCourtCategory(c.courtName) === 'district-court')
    .filter((c) => {
      // Prefer same-region heuristic via shared slug tokens
      const tokens = stateSlug.split('-').filter((t) => t.length > 3)
      if (tokens.length === 0) return true
      const name = c.courtName.toLowerCase()
      return tokens.some((t) => name.includes(t))
    })
    .slice(0, 6)

  const sortedYears = [...years].sort((a, b) => a - b)
  const prevYear = sortedYears.filter((y) => y < year).at(-1)
  const nextYear = sortedYears.find((y) => y > year)

  return (
    <nav
      aria-label="Related court holiday pages"
      className="w-full border-t border-brassLight/30 bg-parchmentDim/30 px-3 py-4 sm:px-4 md:px-6 lg:px-8"
    >
      <h2 className="font-display text-base text-navy sm:text-lg">
        Related Holiday Lists
      </h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <h3 className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-inkSoft">
            Supreme Court
          </h3>
          <ul className="mt-1.5 space-y-1 font-body text-sm">
            <li>
              <Link to={supremeCourtHubPath()} className={linkClass()}>
                Supreme Court hub
              </Link>
            </li>
            <li>
              <Link
                to={courtHolidayPath('Supreme Court of India', year, 'supreme-court')}
                className={linkClass()}
              >
                Supreme Court holidays {year}
              </Link>
            </li>
          </ul>
        </div>

        {(category === 'high-court' || category === 'district-court') && (
          <div>
            <h3 className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-inkSoft">
              State
            </h3>
            <ul className="mt-1.5 space-y-1 font-body text-sm">
              <li>
                <Link to={statePath(stateSlug)} className={linkClass()}>
                  {stateSlug.replace(/-/g, ' ')} courts
                </Link>
              </li>
              <li>
                <Link to={statePath(stateSlug, year)} className={linkClass()}>
                  {stateSlug.replace(/-/g, ' ')} holidays {year}
                </Link>
              </li>
            </ul>
          </div>
        )}

        <div>
          <h3 className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-inkSoft">
            Years
          </h3>
          <ul className="mt-1.5 space-y-1 font-body text-sm">
            {prevYear != null ? (
              <li>
                <Link
                  to={courtHolidayPath(courtName, prevYear, category)}
                  className={linkClass()}
                >
                  Previous year ({prevYear})
                </Link>
              </li>
            ) : null}
            {nextYear != null ? (
              <li>
                <Link
                  to={courtHolidayPath(courtName, nextYear, category)}
                  className={linkClass()}
                >
                  Next year ({nextYear})
                </Link>
              </li>
            ) : null}
            <li>
              <Link to={`/years/${year}`} className={linkClass()}>
                All courts {year}
              </Link>
            </li>
          </ul>
        </div>

        {relatedHighCourts.length > 0 ? (
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-inkSoft">
              Related High Courts
            </h3>
            <ul className="mt-1.5 space-y-1 font-body text-sm">
              {relatedHighCourts.map((c) => (
                <li key={c.courtName}>
                  <Link
                    to={courtHolidayPath(c.courtName, year, 'high-court')}
                    className={linkClass()}
                  >
                    {c.courtName} {year}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {relatedDistrict.length > 0 ? (
          <div className="sm:col-span-2">
            <h3 className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-inkSoft">
              District Courts
            </h3>
            <ul className="mt-1.5 grid gap-1 font-body text-sm sm:grid-cols-2">
              {relatedDistrict.map((c) => (
                <li key={c.courtName}>
                  <Link
                    to={courtHolidayPath(c.courtName, year, 'district-court')}
                    className={linkClass()}
                  >
                    {c.courtName} {year}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </nav>
  )
}
