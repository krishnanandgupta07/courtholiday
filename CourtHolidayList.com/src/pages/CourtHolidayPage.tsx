/**
 * Court holiday page — e.g. /delhi-high-court-holidays-2026
 * Resolves court from slug, injects SEO meta, breadcrumbs, FAQ, internal links.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fetchCourtsList, fetchYears } from '../api/client'
import { CourtHolidayCalendar } from '../components/CourtHolidayCalendar'
import { Breadcrumbs } from '../components/seo/Breadcrumbs'
import { FAQSection } from '../components/seo/FAQSection'
import { InternalLinks } from '../components/seo/InternalLinks'
import { SEO } from '../components/seo/SEO'
import { StructuredData } from '../components/seo/StructuredData'
import {
  canonicalFromPath,
  generateCourtPageSeo,
} from '../seo/content'
import { buildPageSchemas } from '../seo/schema'
import {
  findCourtBySlug,
  parseCourtHolidaySlug,
} from '../seo/slugs'
import type { CourtCategory, CourtOption, Holiday } from '../types/api'
import { classifyCourtCategory } from '../utils/courtCategory'
import {
  clampToSelectableYear,
  filterSelectableYears,
} from '../utils/yearAvailability'

function resolveFromParams(slugParam: string | undefined): {
  category: CourtCategory
  courtSlug: string
  year: number
} | null {
  if (!slugParam) return null
  const parsed = parseCourtHolidaySlug(slugParam)
  if (!parsed) return null
  if (parsed.kind === 'supreme') {
    return {
      category: 'supreme-court',
      courtSlug: 'supreme-court',
      year: parsed.year,
    }
  }
  return {
    category: parsed.kind,
    courtSlug: parsed.slug,
    year: parsed.year,
  }
}

export function CourtHolidayPage() {
  const { courtHolidaySlug } = useParams<{ courtHolidaySlug: string }>()
  const navigate = useNavigate()
  const resolved = useMemo(
    () => resolveFromParams(courtHolidaySlug),
    [courtHolidaySlug],
  )

  const [courts, setCourts] = useState<CourtOption[]>([])
  const [years, setYears] = useState<number[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [liveHolidays, setLiveHolidays] = useState<Holiday[]>([])
  const [liveCourtName, setLiveCourtName] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [courtResult, yearResult] = await Promise.all([
          fetchCourtsList(),
          fetchYears().catch(() => [] as number[]),
        ])
        if (cancelled) return
        setCourts(courtResult.courts)
        setYears(filterSelectableYears(yearResult))
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : 'Failed to load courts',
          )
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const matchedCourt = useMemo(() => {
    if (!resolved) return undefined
    if (resolved.category === 'supreme-court') {
      return (
        courts.find(
          (c) => classifyCourtCategory(c.courtName) === 'supreme-court',
        ) ?? { courtName: 'Supreme Court of India' }
      )
    }
    return findCourtBySlug(courts, resolved.courtSlug, resolved.category)
  }, [courts, resolved])

  const courtName =
    matchedCourt?.courtName ??
    (resolved
      ? resolved.courtSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : 'Court')

  const category = resolved?.category ?? 'high-court'
  const year = clampToSelectableYear(
    resolved?.year ?? new Date().getFullYear(),
  )

  const seo = useMemo(
    () =>
      generateCourtPageSeo({
        courtName: liveCourtName || courtName,
        category,
        year,
        holidays: liveHolidays,
      }),
    [category, courtName, liveCourtName, liveHolidays, year],
  )

  const onHolidaysChange = useCallback(
    (payload: {
      holidays: Holiday[]
      courtName: string
      years: number[]
      courts: CourtOption[]
    }) => {
      setLiveHolidays(payload.holidays)
      if (payload.courtName) setLiveCourtName(payload.courtName)
      if (payload.years.length) setYears(filterSelectableYears(payload.years))
      if (payload.courts.length) setCourts(payload.courts)
    },
    [],
  )

  const schemas = buildPageSchemas({
    title: seo.title,
    description: seo.description,
    path: seo.canonicalPath,
    breadcrumbs: seo.breadcrumbs,
    faqs: seo.faqs,
  })

  if (!resolved) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-parchment px-4 text-ink">
        <SEO
          title="Page Not Found | CourtHoliday"
          description="Unknown court holiday URL."
          noindex
        />
        <h1 className="font-display text-2xl">Page not found</h1>
        <Link to="/" className="text-navy underline">
          Back to home
        </Link>
      </div>
    )
  }

  if (loadError && courts.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-parchment px-4">
        <p className="text-burgundy">{loadError}</p>
        <Link to="/" className="text-navy underline">
          Home
        </Link>
      </div>
    )
  }

  // Courts loaded but slug did not match — soft 404
  if (courts.length > 0 && !matchedCourt && category !== 'supreme-court') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-parchment px-4 text-ink">
        <SEO
          title="Court Not Found | CourtHoliday"
          description="This court holiday page could not be resolved."
          noindex
        />
        <h1 className="font-display text-2xl">Court not found</h1>
        <p className="font-body text-sm text-inkSoft">
          No court matches “{resolved.courtSlug}”.
        </p>
        <Link to="/high-courts" className="text-navy underline">
          Browse High Courts
        </Link>
      </div>
    )
  }

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
        initialCategory={category}
        initialCourtName={matchedCourt?.courtName ?? courtName}
        initialYear={year}
        pageTitle={seo.h1}
        onHomeClick={() => navigate('/')}
        onContactClick={() => navigate('/contact')}
        onHolidaysChange={onHolidaysChange}
        topSlot={<Breadcrumbs items={seo.breadcrumbs} />}
        bottomSlot={
          <>
            <FAQSection faqs={seo.faqs} />
            <InternalLinks
              courtName={liveCourtName || courtName}
              category={category}
              year={year}
              courts={courts}
              years={years}
            />
          </>
        }
      />
    </>
  )
}
