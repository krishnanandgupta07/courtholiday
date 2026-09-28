/**
 * Year hub — /years/:year — links to courts with holiday pages for that year.
 */
import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { fetchCourtsList } from '../api/client'
import { Footer } from '../components/Footer'
import { AppDownloadBanner } from '../components/AppDownloadBanner'
import { Breadcrumbs } from '../components/seo/Breadcrumbs'
import { FAQSection } from '../components/seo/FAQSection'
import { SEO } from '../components/seo/SEO'
import { StructuredData } from '../components/seo/StructuredData'
import { canonicalFromPath, generateYearHubSeo } from '../seo/content'
import { buildPageSchemas } from '../seo/schema'
import { courtHolidayPath } from '../seo/slugs'
import type { CourtOption } from '../types/api'
import { classifyCourtCategory } from '../utils/courtCategory'
import {
  clampToSelectableYear,
  isYearSelectable,
} from '../utils/yearAvailability'

export function YearHubPage() {
  const { year: yearParam } = useParams<{ year: string }>()
  const requestedYear = Number(yearParam) || new Date().getFullYear()
  const year = clampToSelectableYear(requestedYear)
  const yearReleased = isYearSelectable(requestedYear)

  const seo = useMemo(() => generateYearHubSeo(year), [year])
  const [courts, setCourts] = useState<CourtOption[]>([])

  useEffect(() => {
    void fetchCourtsList().then((r) => setCourts(r.courts))
  }, [])

  const featured = useMemo(() => {
    const sc = courts.filter(
      (c) => classifyCourtCategory(c.courtName) === 'supreme-court',
    )
    const hc = courts
      .filter((c) => classifyCourtCategory(c.courtName) === 'high-court')
      .slice(0, 40)
    return [...sc, ...hc]
  }, [courts])

  const schemas = buildPageSchemas({
    title: seo.title,
    description: seo.description,
    path: seo.canonicalPath,
    breadcrumbs: seo.breadcrumbs,
    faqs: seo.faqs,
  })

  // Unreleased next-year hub → redirect to current year
  if (!yearReleased) {
    return <Navigate to={`/years/${year}`} replace />
  }

  return (
    <div className="flex min-h-screen flex-col bg-parchment bg-parchment-grid bg-grid text-ink">
      <div className="flex w-full min-w-0 flex-1 flex-col">
      <SEO
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        canonical={canonicalFromPath(seo.canonicalPath)}
      />
      <StructuredData schemas={schemas} />
      <header className="border-b border-brassLight/25 bg-masthead text-parchment">
        <div className="px-3 py-2.5 sm:px-4 md:px-6 lg:px-8">
          <Link to="/" className="font-display text-sm hover:opacity-90">
            Court Holidays Calendar
          </Link>
        </div>
      </header>
      <Breadcrumbs items={seo.breadcrumbs} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-3 py-5 sm:px-4">
        <h1 className="font-display text-xl text-navy sm:text-2xl">{seo.h1}</h1>
        <p className="mt-2 font-body text-sm text-inkSoft">{seo.description}</p>
        <ul className="mt-6 grid gap-2 sm:grid-cols-2">
          {featured.map((court) => {
            const cat = classifyCourtCategory(court.courtName)
            return (
              <li key={court.courtName}>
                <Link
                  to={courtHolidayPath(court.courtName, year, cat)}
                  className="block rounded-sm border border-brassLight/40 bg-parchmentDim/40 px-3 py-2.5 font-body text-sm text-navy hover:border-brass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
                >
                  {court.courtName} — {year}
                </Link>
              </li>
            )
          })}
        </ul>
        <p className="mt-4 font-body text-sm">
          <Link to="/high-courts" className="text-navy underline">
            Browse all High Courts
          </Link>
          {' · '}
          <Link to="/district-courts" className="text-navy underline">
            District Courts
          </Link>
        </p>
        <FAQSection faqs={seo.faqs} />
      </main>
      <AppDownloadBanner />
      </div>
      <Footer />
    </div>
  )
}
