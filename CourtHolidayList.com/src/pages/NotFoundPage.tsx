/**
 * In-app 404 — unknown routes. noindex for Search Console hygiene.
 */
import { Link } from 'react-router-dom'
import { Footer } from '../components/Footer'
import { AppDownloadBanner } from '../components/AppDownloadBanner'
import { SEO } from '../components/seo/SEO'
import { StructuredData } from '../components/seo/StructuredData'
import { canonicalFromPath, generateNotFoundSeo } from '../seo/content'
import { buildPageSchemas } from '../seo/schema'

export function NotFoundPage() {
  const seo = generateNotFoundSeo()
  const schemas = buildPageSchemas({
    title: seo.title,
    description: seo.description,
    path: '/',
    breadcrumbs: seo.breadcrumbs,
    faqs: [],
  })

  return (
    <div className="flex min-h-screen flex-col bg-parchment bg-parchment-grid bg-grid text-ink">
      <div className="flex w-full min-w-0 flex-1 flex-col">
      <SEO
        title={seo.title}
        description={seo.description}
        canonical={canonicalFromPath('/')}
        noindex
      />
      <StructuredData schemas={schemas} />
      <header className="border-b border-brassLight/25 bg-masthead text-parchment">
        <div className="px-3 py-2.5 sm:px-4 md:px-6 lg:px-8">
          <Link to="/" className="font-display text-sm hover:opacity-90">
            Court Holidays Calendar
          </Link>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass">
          Error 404
        </p>
        <h1 className="font-display text-3xl text-navy">{seo.h1}</h1>
        <p className="font-body text-sm text-inkSoft">{seo.description}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-3 font-body text-sm">
          <Link
            to="/"
            className="rounded-sm border border-brass bg-brass px-4 py-2 font-semibold text-navyDeep hover:bg-brassLight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
          >
            Home
          </Link>
          <Link
            to="/high-courts"
            className="rounded-sm border border-brassLight/50 px-4 py-2 text-navy hover:bg-parchmentDim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
          >
            High Courts
          </Link>
          <Link
            to="/contact"
            className="rounded-sm border border-brassLight/50 px-4 py-2 text-navy hover:bg-parchmentDim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
          >
            Contact
          </Link>
        </div>
      </main>
      <AppDownloadBanner />
      </div>
      <Footer />
    </div>
  )
}
