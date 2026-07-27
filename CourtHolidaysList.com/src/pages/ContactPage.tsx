/**
 * Contact page route wrapper — /contact
 * Reuses ContactUsPage UI; adds SEO meta.
 */
import { useNavigate } from 'react-router-dom'
import { ContactUsPage } from '../components/ContactUsPage'
import { SEO } from '../components/seo/SEO'
import { StructuredData } from '../components/seo/StructuredData'
import { canonicalFromPath, generateContactSeo } from '../seo/content'
import { buildPageSchemas } from '../seo/schema'

export function ContactPage() {
  const navigate = useNavigate()
  const seo = generateContactSeo()
  const schemas = buildPageSchemas({
    title: seo.title,
    description: seo.description,
    path: seo.canonicalPath,
    breadcrumbs: seo.breadcrumbs,
    faqs: [],
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
      <ContactUsPage
        onBack={() => navigate('/')}
        onOpenContact={() => navigate('/contact')}
      />
    </>
  )
}
