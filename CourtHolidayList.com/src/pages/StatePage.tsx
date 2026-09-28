/**
 * State hub — /states/:stateSlug and /states/:stateSlug/holidays-:year
 * When a High Court matches the state, shows that calendar on this URL (FAQ + related courts below).
 */
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fetchCourtsList, fetchYears } from '../api/client'
import { AppDownloadBanner } from '../components/AppDownloadBanner'
import { CourtHolidayCalendar } from '../components/CourtHolidayCalendar'
import { Footer } from '../components/Footer'
import { Breadcrumbs } from '../components/seo/Breadcrumbs'
import { FAQSection } from '../components/seo/FAQSection'
import { SEO } from '../components/seo/SEO'
import { StructuredData } from '../components/seo/StructuredData'
import { canonicalFromPath, generateStateSeo } from '../seo/content'
import { buildPageSchemas } from '../seo/schema'
import {
  courtHolidayPath,
  statePath,
  stateSlugFromCourt,
  toSlug,
} from '../seo/slugs'
import type { CourtOption } from '../types/api'
import { classifyCourtCategory } from '../utils/courtCategory'
import {
  clampToSelectableYear,
  filterSelectableYears,
} from '../utils/yearAvailability'

export function StatePage() {
  const navigate = useNavigate()
  const { stateSlug, yearSegment } = useParams<{
    stateSlug: string
    yearSegment?: string
  }>()
  const yearMatch = yearSegment?.match(/^holidays-(\d{4})$/)
  const yearFromUrl = yearMatch ? Number(yearMatch[1]) : undefined
  const slug = stateSlug ?? ''
  const invalidYearSegment = Boolean(yearSegment && !yearMatch)
  const stateLabel = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  const [courts, setCourts] = useState<CourtOption[]>([])
  const [years, setYears] = useState<number[]>([])

  useEffect(() => {
    void Promise.all([
      fetchCourtsList(),
      fetchYears().catch(() => [] as number[]),
    ]).then(([courtResult, yearResult]) => {
      setCourts(courtResult.courts)
      setYears(filterSelectableYears(yearResult))
    })
  }, [])

  const related = useMemo(
    () =>
      courts.filter((c) => {
        const cat = classifyCourtCategory(c.courtName)
        if (cat !== 'high-court' && cat !== 'district-court') return false
        return stateSlugFromCourt(c.courtName) === toSlug(slug)
      }),
    [courts, slug],
  )

  const primaryHighCourt = useMemo(
    () =>
      related.find(
        (c) => classifyCourtCategory(c.courtName) === 'high-court',
      ),
    [related],
  )

  const seo = generateStateSeo(slug, stateLabel, yearFromUrl)
  const displayYear = clampToSelectableYear(
    yearFromUrl ?? years[0] ?? new Date().getFullYear(),
  )

  const schemas = buildPageSchemas({
    title: seo.title,
    description: seo.description,
    path: seo.canonicalPath,
    breadcrumbs: seo.breadcrumbs,
    faqs: seo.faqs,
  })

  if (invalidYearSegment) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-parchment px-4 text-ink">
        <SEO
          title="Page Not Found | CourtHolidayList"
          description="Unknown state holiday URL."
          noindex
        />
        <h1 className="font-display text-2xl">Page not found</h1>
        <Link to={statePath(slug)} className="text-navy underline">
          Back to {stateLabel}
        </Link>
      </div>
    )
  }

  const relatedLinks = (
    <nav
      aria-label={`${stateLabel} court holiday links`}
      className="border-t border-brassLight/30 bg-parchmentDim/30 px-3 py-4 sm:px-4 md:px-6 lg:px-8"
    >
      <h2 className="font-display text-base text-navy sm:text-lg">
        Courts in {stateLabel}
      </h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {related.map((court) => {
          const cat = classifyCourtCategory(court.courtName)
          return (
            <li key={court.courtName}>
              <Link
                to={courtHolidayPath(court.courtName, displayYear, cat)}
                className="block rounded-sm border border-brassLight/40 bg-parchment px-3 py-2.5 font-body text-sm text-navy transition hover:border-brass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
              >
                {court.courtName} — Holidays {displayYear}
              </Link>
            </li>
          )
        })}
      </ul>
      {yearFromUrl == null && years.length > 1 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {years.map((y) => (
            <Link
              key={y}
              to={statePath(slug, y)}
              className="rounded-sm border border-brassLight/50 px-2.5 py-1 font-body text-xs text-navy hover:bg-parchmentDim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
            >
              {y}
            </Link>
          ))}
        </div>
      ) : null}
      <FAQSection faqs={seo.faqs} />
    </nav>
  )

  if (primaryHighCourt) {
    return (
      <>
        <SEO
          title={seo.title}
          description={seo.description}
          keywords={seo.keywords}
          canonical={canonicalFromPath(seo.canonicalPath)}
        />
        <StructuredData schemas={schemas} />
        <CourtHolidayCalendar
          initialCategory="high-court"
          initialCourtName={primaryHighCourt.courtName}
          initialYear={displayYear}
          pageTitle={seo.h1}
          onHomeClick={() => navigate('/')}
          onContactClick={() => navigate('/contact')}
          bottomSlot={relatedLinks}
        />
      </>
    )
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
      <main className="mx-auto w-full max-w-3xl flex-1 px-3 py-5 sm:px-4">
        <h1 className="font-display text-xl text-navy sm:text-2xl">{seo.h1}</h1>
        <p className="mt-2 font-body text-sm text-inkSoft">{seo.description}</p>

        {yearFromUrl == null && years.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {years.map((y) => (
              <Link
                key={y}
                to={statePath(slug, y)}
                className="rounded-sm border border-brassLight/50 px-2.5 py-1 font-body text-xs text-navy hover:bg-parchmentDim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
              >
                {y}
              </Link>
            ))}
          </div>
        ) : null}

        <ul className="mt-6 space-y-2">
          {related.map((court) => {
            const cat = classifyCourtCategory(court.courtName)
            return (
              <li key={court.courtName}>
                <Link
                  to={courtHolidayPath(court.courtName, displayYear, cat)}
                  className="block rounded-sm border border-brassLight/40 bg-parchmentDim/40 px-3 py-2.5 font-body text-sm text-navy hover:border-brass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
                >
                  {court.courtName} — Holidays {displayYear}
                </Link>
              </li>
            )
          })}
        </ul>
        <FAQSection faqs={seo.faqs} />
      </main>
      <AppDownloadBanner />
      </div>
      <Footer />
    </div>
  )
}
