/**
 * Home — default High Court calendar (Telangana / Hyderabad).
 * SEO: home meta + FAQ; calendar UI unchanged.
 */
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { CourtHolidayCalendar } from '../components/CourtHolidayCalendar'
import { FAQSection } from '../components/seo/FAQSection'
import { SEO } from '../components/seo/SEO'
import { StructuredData } from '../components/seo/StructuredData'
import { canonicalFromPath, generateHomeSeo } from '../seo/content'
import { buildPageSchemas } from '../seo/schema'

export function HomePage() {
  const navigate = useNavigate()
  const year = new Date().getFullYear()
  const seo = useMemo(() => generateHomeSeo(year), [year])

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
        initialCategory="high-court"
        pageTitle={seo.h1}
        onHomeClick={() => navigate('/')}
        onContactClick={() => navigate('/contact')}
        bottomSlot={<FAQSection faqs={seo.faqs} />}
      />
    </>
  )
}
