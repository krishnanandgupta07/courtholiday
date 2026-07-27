/**
 * Supreme Court hub — /supreme-court
 * Links to year-specific holiday pages.
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchYears } from '../api/client'
import { Footer } from '../components/Footer'
import { AppDownloadBanner } from '../components/AppDownloadBanner'
import { Breadcrumbs } from '../components/seo/Breadcrumbs'
import { FAQSection } from '../components/seo/FAQSection'
import { SEO } from '../components/seo/SEO'
import { StructuredData } from '../components/seo/StructuredData'
import { canonicalFromPath, generateSupremeHubSeo } from '../seo/content'
import { buildPageSchemas } from '../seo/schema'
import { courtHolidayPath } from '../seo/slugs'
import { filterSelectableYears } from '../utils/yearAvailability'

export function SupremeCourtHubPage() {
  const seo = generateSupremeHubSeo()
  const [years, setYears] = useState<number[]>(() =>
    filterSelectableYears([
      new Date().getFullYear(),
      new Date().getFullYear() + 1,
    ]),
  )

  useEffect(() => {
    void fetchYears()
      .then((result) => setYears(filterSelectableYears(result)))
      .catch(() => undefined)
  }, [])

  const schemas = buildPageSchemas({
    title: seo.title,
    description: seo.description,
    path: seo.canonicalPath,
    breadcrumbs: seo.breadcrumbs,
    faqs: seo.faqs,
  })

  return (
    <div className="flex min-h-screen flex-col bg-parchment bg-parchment-grid bg-grid text-ink">
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
        <ul className="mt-6 space-y-2">
          {years.map((year) => (
            <li key={year}>
              <Link
                to={courtHolidayPath(
                  'Supreme Court of India',
                  year,
                  'supreme-court',
                )}
                className="block rounded-sm border border-brassLight/40 bg-parchmentDim/40 px-3 py-2.5 font-body text-sm text-navy hover:border-brass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
              >
                Supreme Court Holidays {year}
              </Link>
            </li>
          ))}
        </ul>
        <FAQSection faqs={seo.faqs} />
      </main>
      <AppDownloadBanner />
      <Footer />
    </div>
  )
}
