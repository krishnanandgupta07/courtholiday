/**
 * Reusable SEO head component.
 * Sets title, description, canonical, robots, Open Graph, and Twitter Card tags
 * via react-helmet-async. WhatsApp / Facebook / LinkedIn read OG tags.
 */
import { Helmet } from 'react-helmet-async'
import {
  DEFAULT_OG_IMAGE,
  DEFAULT_ROBOTS,
  SITE_NAME,
  SITE_URL,
} from '../../seo/constants'
import { absoluteUrl } from '../../seo/slugs'

export interface SEOProps {
  title: string
  description: string
  keywords?: string
  /** Path or absolute URL — normalized to absolute canonical. */
  canonical?: string
  image?: string
  robots?: string
  noindex?: boolean
  type?: 'website' | 'article'
  /** Optional pagination link rels for crawlable listing pages. */
  prevPath?: string | null
  nextPath?: string | null
}

function toAbsolute(urlOrPath: string | undefined, fallback: string): string {
  if (!urlOrPath) return fallback
  if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
    return urlOrPath
  }
  return absoluteUrl(urlOrPath)
}

export function SEO({
  title,
  description,
  keywords,
  canonical,
  image = DEFAULT_OG_IMAGE,
  robots,
  noindex = false,
  type = 'website',
  prevPath,
  nextPath,
}: SEOProps) {
  const canonicalUrl = toAbsolute(canonical, `${SITE_URL}/`)
  const imageUrl = toAbsolute(image, DEFAULT_OG_IMAGE)
  const robotsContent = noindex
    ? 'noindex, follow'
    : robots ?? DEFAULT_ROBOTS

  return (
    <Helmet prioritizeSeoTags>
      <html lang="en" />
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords ? <meta name="keywords" content={keywords} /> : null}
      <meta name="robots" content={robotsContent} />
      <meta name="googlebot" content={robotsContent} />
      <meta name="author" content={SITE_NAME} />
      <meta name="application-name" content={SITE_NAME} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph — Facebook, LinkedIn, WhatsApp previews */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:alt" content={title} />

      {/* Twitter / X Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {prevPath ? (
        <link rel="prev" href={toAbsolute(prevPath, SITE_URL)} />
      ) : null}
      {nextPath ? (
        <link rel="next" href={toAbsolute(nextPath, SITE_URL)} />
      ) : null}
    </Helmet>
  )
}
