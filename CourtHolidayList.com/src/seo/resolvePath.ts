/**
 * Resolve a path to SEO content for prerender / sitemap injection.
 * Mirrors route taxonomy without mounting React.
 */
import type { CourtCategory, CourtOption } from '../types/api'
import { classifyCourtCategory } from '../utils/courtCategory'
import {
  generateCategoryListingSeo,
  generateContactSeo,
  generateCourtPageSeo,
  generateHomeSeo,
  generateNotFoundSeo,
  generateStateSeo,
  generateSupremeHubSeo,
  generateYearHubSeo,
  type SeoContent,
} from './content'
import {
  findCourtBySlug,
  parseCourtHolidaySlug,
  stateSlugFromCourt,
  toSlug,
} from './slugs'

export function seoContentForPath(
  path: string,
  courts: CourtOption[],
  years: number[],
): SeoContent {
  const clean = path.replace(/\/$/, '') || '/'
  const yearDefault = years[0] ?? new Date().getFullYear()

  if (clean === '/') return generateHomeSeo(yearDefault)
  if (clean === '/contact') return generateContactSeo()
  if (clean === '/supreme-court') return generateSupremeHubSeo()
  if (clean === '/404') return generateNotFoundSeo()

  const yearHub = clean.match(/^\/years\/(\d{4})$/)
  if (yearHub) return generateYearHubSeo(Number(yearHub[1]))

  const listing = clean.match(
    /^\/(high-courts|district-courts|tribunals)(?:\/page\/(\d+))?$/,
  )
  if (listing) {
    const category: CourtCategory =
      listing[1] === 'high-courts'
        ? 'high-court'
        : listing[1] === 'district-courts'
          ? 'district-court'
          : 'tribunal'
    const page = Number(listing[2] ?? 1)
    return generateCategoryListingSeo(category, page, yearDefault)
  }

  const stateYear = clean.match(/^\/states\/([^/]+)\/holidays-(\d{4})$/)
  if (stateYear) {
    const slug = stateYear[1]
    const label = slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
    return generateStateSeo(slug, label, Number(stateYear[2]))
  }

  const stateOnly = clean.match(/^\/states\/([^/]+)$/)
  if (stateOnly) {
    const slug = stateOnly[1]
    const label = slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
    return generateStateSeo(slug, label)
  }

  const segment = clean.replace(/^\//, '')
  const parsed = parseCourtHolidaySlug(segment)
  if (parsed) {
    if (parsed.kind === 'supreme') {
      const sc =
        courts.find(
          (c) => classifyCourtCategory(c.courtName) === 'supreme-court',
        )?.courtName ?? 'Supreme Court of India'
      return generateCourtPageSeo({
        courtName: sc,
        category: 'supreme-court',
        year: parsed.year,
      })
    }
    const matched = findCourtBySlug(courts, parsed.slug, parsed.kind)
    const courtName =
      matched?.courtName ??
      parsed.slug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    return generateCourtPageSeo({
      courtName,
      category: parsed.kind,
      year: parsed.year,
    })
  }

  return generateNotFoundSeo()
}

/** Unique state slugs derived from courts (for validation). */
export function collectStateSlugs(courts: CourtOption[]): string[] {
  const set = new Set<string>()
  for (const court of courts) {
    const cat = classifyCourtCategory(court.courtName)
    if (cat === 'high-court' || cat === 'district-court') {
      set.add(toSlug(stateSlugFromCourt(court.courtName)))
    }
  }
  return [...set]
}
