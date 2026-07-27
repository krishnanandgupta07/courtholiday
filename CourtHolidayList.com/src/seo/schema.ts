/**
 * JSON-LD Schema.org builders for Organization, WebSite, WebPage,
 * BreadcrumbList, FAQPage, and SearchAction.
 */
import type { BreadcrumbItem, FaqItem } from './content'
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from './constants'
import { absoluteUrl } from './slugs'

export interface WebPageSchemaInput {
  title: string
  description: string
  path: string
  dateModified?: string
}

function graph(...nodes: Record<string, unknown>[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes,
  }
}

/** Site-wide Organization + WebSite (with SearchAction) — include on every page. */
export function organizationAndWebsiteSchema() {
  return graph(
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: DEFAULT_OG_IMAGE,
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      publisher: { '@id': `${SITE_URL}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          // Browse High Courts directory (path-based; no query-string SEO URLs)
          urlTemplate: `${SITE_URL}/high-courts`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
  )
}

export function webPageSchema(input: WebPageSchemaInput) {
  const url = absoluteUrl(input.path)
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: input.title,
    description: input.description,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#organization` },
    ...(input.dateModified
      ? { dateModified: input.dateModified }
      : {}),
  }
}

export function breadcrumbListSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function faqPageSchema(faqs: FaqItem[]) {
  if (faqs.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

/** Combine all schemas for a page into a single @graph document when possible. */
export function buildPageSchemas(options: {
  title: string
  description: string
  path: string
  breadcrumbs: BreadcrumbItem[]
  faqs: FaqItem[]
  includeSiteGraph?: boolean
  dateModified?: string
}): Record<string, unknown>[] {
  const schemas: Record<string, unknown>[] = []

  if (options.includeSiteGraph !== false) {
    schemas.push(organizationAndWebsiteSchema())
  }

  schemas.push(
    webPageSchema({
      title: options.title,
      description: options.description,
      path: options.path,
      dateModified: options.dateModified,
    }),
  )

  if (options.breadcrumbs.length > 0) {
    schemas.push(breadcrumbListSchema(options.breadcrumbs))
  }

  const faq = faqPageSchema(options.faqs)
  if (faq) schemas.push(faq)

  return schemas
}
