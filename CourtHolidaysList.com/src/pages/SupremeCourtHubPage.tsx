/**
 * Supreme Court hub — /supreme-court
 * Shows the live holiday calendar on this ranked URL (FAQ below).
 * Google often lands here for "supreme court holiday calendar".
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchYears } from '../api/client'
import { CourtHolidayCalendar } from '../components/CourtHolidayCalendar'
import { FAQSection } from '../components/seo/FAQSection'
import { InternalLinks } from '../components/seo/InternalLinks'
import { SEO } from '../components/seo/SEO'
import { StructuredData } from '../components/seo/StructuredData'
import { canonicalFromPath, generateSupremeHubSeo } from '../seo/content'
import { buildPageSchemas } from '../seo/schema'
import type { CourtOption } from '../types/api'
import {
  clampToSelectableYear,
  filterSelectableYears,
} from '../utils/yearAvailability'

export function SupremeCourtHubPage() {
  const navigate = useNavigate()
  const year = clampToSelectableYear(new Date().getFullYear())
  const seo = useMemo(() => generateSupremeHubSeo(year), [year])

  const [years, setYears] = useState<number[]>(() =>
    filterSelectableYears([year, year + 1]),
  )
  const [liveCourtName, setLiveCourtName] = useState('Supreme Court of India')
  const [courts, setCourts] = useState<CourtOption[]>([])

  useEffect(() => {
    void fetchYears()
      .then((result) => setYears(filterSelectableYears(result)))
      .catch(() => undefined)
  }, [])

  const onHolidaysChange = useCallback(
    (payload: {
      holidays: unknown
      courtName: string
      years: number[]
      courts: CourtOption[]
    }) => {
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
        initialCategory="supreme-court"
        initialCourtName="Supreme Court of India"
        initialYear={year}
        pageTitle={seo.h1}
        onHomeClick={() => navigate('/')}
        onContactClick={() => navigate('/contact')}
        onHolidaysChange={onHolidaysChange}
        bottomSlot={
          <>
            <FAQSection faqs={seo.faqs} />
            <InternalLinks
              courtName={liveCourtName}
              category="supreme-court"
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
