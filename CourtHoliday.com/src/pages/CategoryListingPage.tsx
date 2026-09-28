/**
 * Category listing with crawlable pagination — /high-courts, /district-courts/page/2, etc.
 * Page 1 for High Courts embeds the live calendar (search landings expect a calendar, not only links).
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
import {
  canonicalFromPath,
  generateCategoryListingSeo,
} from '../seo/content'
import { buildPageSchemas } from '../seo/schema'
import { paginateCourts } from '../seo/routes'
import {
  categoryListingPath,
  courtHolidayPath,
} from '../seo/slugs'
import type { CourtCategory, CourtOption } from '../types/api'
import { filterCourtsByCategory } from '../utils/courtCategory'
import {
  clampToSelectableYear,
  filterSelectableYears,
} from '../utils/yearAvailability'

const CATEGORY_BY_SEGMENT: Record<string, CourtCategory> = {
  'high-courts': 'high-court',
  'district-courts': 'district-court',
  tribunals: 'tribunal',
}

const HC_DEFAULT_COURT = 'Telangana High Court'

interface CategoryListingPageProps {
  categorySegment: 'high-courts' | 'district-courts' | 'tribunals'
}

export function CategoryListingPage({
  categorySegment,
}: CategoryListingPageProps) {
  const { page: pageParam } = useParams<{ page?: string }>()
  const navigate = useNavigate()
  const category = CATEGORY_BY_SEGMENT[categorySegment]
  const pageNum = Math.max(1, Number(pageParam) || 1)

  const [courts, setCourts] = useState<CourtOption[]>([])
  const [years, setYears] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const [courtResult, yearResult] = await Promise.all([
          fetchCourtsList(),
          fetchYears().catch(() => [] as number[]),
        ])
        if (cancelled) return
        setCourts(courtResult.courts)
        setYears(filterSelectableYears(yearResult))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(
    () => filterCourtsByCategory(courts, category),
    [category, courts],
  )
  const { pageItems, page, totalPages } = paginateCourts(filtered, pageNum)
  const year = clampToSelectableYear(years[0] ?? new Date().getFullYear())
  const seo = generateCategoryListingSeo(category, page, year)

  const prevPath =
    page > 1 ? categoryListingPath(category, page - 1) : null
  const nextPath =
    page < totalPages ? categoryListingPath(category, page + 1) : null

  // Redirect /high-courts/page/1 → /high-courts
  useEffect(() => {
    if (pageParam === '1') {
      navigate(categoryListingPath(category), { replace: true })
    }
  }, [category, navigate, pageParam])

  const schemas = buildPageSchemas({
    title: seo.title,
    description: seo.description,
    path: seo.canonicalPath,
    breadcrumbs: seo.breadcrumbs,
    faqs: seo.faqs,
  })

  const showEmbeddedCalendar =
    category === 'high-court' && page === 1 && !loading && filtered.length > 0

  const defaultCourt =
    filtered.find((c) =>
      c.courtName.toLowerCase().includes(HC_DEFAULT_COURT.toLowerCase()),
    ) ?? filtered[0]

  const courtDirectory = (
    <nav
      aria-label={`${seo.h1} directory`}
      className="border-t border-brassLight/30 bg-parchmentDim/30 px-3 py-4 sm:px-4 md:px-6 lg:px-8"
    >
      <h2 className="font-display text-base text-navy sm:text-lg">
        All {seo.h1.replace(/ Holiday Lists.*/i, '')} courts
      </h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {pageItems.map((court) => (
          <li key={court.courtName}>
            <Link
              to={courtHolidayPath(court.courtName, year, category)}
              className="block rounded-sm border border-brassLight/40 bg-parchment px-3 py-2.5 font-body text-sm text-navy transition hover:border-brass hover:bg-parchmentDim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
            >
              {court.courtName} — Holidays {year}
            </Link>
          </li>
        ))}
      </ul>
      {totalPages > 1 ? (
        <div className="mt-4 flex flex-wrap items-center gap-3 font-body text-sm">
          {prevPath ? (
            <Link to={prevPath} rel="prev" className="text-navy underline">
              ← Previous
            </Link>
          ) : null}
          <span className="text-inkSoft">
            Page {page} of {totalPages}
          </span>
          {nextPath ? (
            <Link to={nextPath} rel="next" className="text-navy underline">
              Next →
            </Link>
          ) : null}
        </div>
      ) : null}
      <FAQSection faqs={seo.faqs} />
    </nav>
  )

  if (showEmbeddedCalendar && defaultCourt) {
    return (
      <>
        <SEO
          title={seo.title}
          description={seo.description}
          keywords={seo.keywords}
          canonical={canonicalFromPath(seo.canonicalPath)}
          prevPath={prevPath}
          nextPath={nextPath}
        />
        <StructuredData schemas={schemas} />
        <CourtHolidayCalendar
          initialCategory="high-court"
          initialCourtName={defaultCourt.courtName}
          initialYear={year}
          pageTitle={seo.h1}
          onHomeClick={() => navigate('/')}
          onContactClick={() => navigate('/contact')}
          bottomSlot={courtDirectory}
        />
      </>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-parchment bg-parchment-grid bg-grid text-ink">
      <div className="relative flex min-h-0 flex-1 flex-col">
      <SEO
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        canonical={canonicalFromPath(seo.canonicalPath)}
        prevPath={prevPath}
        nextPath={nextPath}
      />
      <StructuredData schemas={schemas} />
      <header className="border-b border-brassLight/25 bg-masthead text-parchment">
        <div className="flex items-center justify-between px-3 py-2.5 sm:px-4 md:px-6 lg:px-8">
          <Link
            to="/"
            className="font-display text-sm text-parchment hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
          >
            Court Holidays Calendar
          </Link>
          <Link
            to="/contact"
            className="font-body text-xs uppercase tracking-wider text-brassLight hover:underline"
          >
            Contact
          </Link>
        </div>
      </header>
      <Breadcrumbs items={seo.breadcrumbs} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-3 py-5 sm:px-4 md:px-6">
        <h1 className="font-display text-xl text-navy sm:text-2xl">{seo.h1}</h1>
        <p className="mt-2 font-body text-sm text-inkSoft">{seo.description}</p>

        {loading ? (
          <div
            className="mt-6 h-40 animate-pulse border border-brassLight/40 bg-parchmentDim/60"
            aria-busy
            aria-label="Loading courts"
          />
        ) : pageItems.length === 0 ? (
          <section
            aria-labelledby="listing-coming-soon"
            className="mt-6 border border-brassLight/50 bg-parchment/90 px-6 py-10 text-center shadow-slip"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brass">
              Coming soon
            </p>
            <h2
              id="listing-coming-soon"
              className="mt-2 font-display text-xl text-navy"
            >
              {seo.h1}
            </h2>
            <p className="mx-auto mt-3 max-w-lg font-body text-sm leading-relaxed text-inkSoft">
              This section is not available yet. We are preparing the holiday
              data and will publish it here soon.
            </p>
            <p className="mt-4 font-body text-sm">
              <Link to="/high-courts" className="text-navy underline">
                Browse High Courts
              </Link>
              {' · '}
              <Link to="/supreme-court" className="text-navy underline">
                Supreme Court
              </Link>
            </p>
          </section>
        ) : (
          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {pageItems.map((court) => (
              <li key={court.courtName}>
                <Link
                  to={courtHolidayPath(court.courtName, year, category)}
                  className="block rounded-sm border border-brassLight/40 bg-parchmentDim/40 px-3 py-2.5 font-body text-sm text-navy transition hover:border-brass hover:bg-parchmentDim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
                >
                  {court.courtName} — Holidays {year}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 ? (
          <nav
            aria-label="Pagination"
            className="mt-6 flex flex-wrap items-center gap-3 font-body text-sm"
          >
            {prevPath ? (
              <Link
                to={prevPath}
                rel="prev"
                className="rounded-sm border border-brassLight/50 px-3 py-1.5 text-navy hover:bg-parchmentDim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
              >
                ← Previous
              </Link>
            ) : (
              <span className="px-3 py-1.5 text-inkSoft">← Previous</span>
            )}
            <span className="text-inkSoft">
              Page {page} of {totalPages}
            </span>
            {nextPath ? (
              <Link
                to={nextPath}
                rel="next"
                className="rounded-sm border border-brassLight/50 px-3 py-1.5 text-navy hover:bg-parchmentDim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
              >
                Next →
              </Link>
            ) : (
              <span className="px-3 py-1.5 text-inkSoft">Next →</span>
            )}
          </nav>
        ) : null}

        <FAQSection faqs={seo.faqs} />
      </main>
      <AppDownloadBanner />
      </div>
      <Footer />
    </div>
  )
}
