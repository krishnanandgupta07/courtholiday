/**
 * SEO-friendly URL slug helpers.
 * Bidirectional mapping between court names and path segments matching sitemap patterns.
 */
import type { CourtCategory } from '../types/api'
import { classifyCourtCategory } from '../utils/courtCategory'
import { clampToSelectableYear } from '../utils/yearAvailability'
import { SITE_URL } from './constants'

/** Normalize text into a URL slug (lowercase, hyphens, no punctuation). */
export function toSlug(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
}

/**
 * Extract the regional slug from a High Court name.
 * "Delhi High Court" → "delhi"
 * "Jammu and Kashmir and Ladakh High Court" → "jammu-and-kashmir-and-ladakh"
 */
export function highCourtRegionSlug(courtName: string): string {
  const cleaned = courtName
    .replace(/\bHigh Court\b/gi, '')
    .replace(/\bof India\b/gi, '')
    .trim()
  return toSlug(cleaned)
}

/**
 * Extract region/state slug from a District Court name.
 * "Hyderabad District Court" → "hyderabad"
 */
export function districtCourtRegionSlug(courtName: string): string {
  const cleaned = courtName
    .replace(/\bDistrict\s*(?:&|and)?\s*Sessions?\s*Court\b/gi, '')
    .replace(/\bDistrict Court\b/gi, '')
    .replace(/\bSessions Court\b/gi, '')
    .replace(/\bCity Civil\b/gi, '')
    .trim()
  return toSlug(cleaned) || toSlug(courtName)
}

/**
 * State hub slug derived from a High Court name (same as region slug).
 * Falls back to full court slug for non-HC courts.
 */
export function stateSlugFromCourt(courtName: string): string {
  const category = classifyCourtCategory(courtName)
  if (category === 'high-court') return highCourtRegionSlug(courtName)
  if (category === 'district-court') return districtCourtRegionSlug(courtName)
  return toSlug(courtName)
}

/** Build holiday list path for a court + year (matches sitemap taxonomy). */
export function courtHolidayPath(
  courtName: string,
  year: number,
  category?: CourtCategory,
): string {
  const cat = category ?? classifyCourtCategory(courtName)

  if (cat === 'supreme-court') {
    // Ranked hub URL for the primary selectable year; year slugs for others
    if (year === clampToSelectableYear(new Date().getFullYear())) {
      return '/supreme-court'
    }
    return `/supreme-court-holidays-${year}`
  }
  if (cat === 'district-court') {
    const slug = districtCourtRegionSlug(courtName)
    return `/${slug}-district-court-holidays-${year}`
  }
  if (cat === 'tribunal') {
    const slug = toSlug(courtName)
    return `/${slug}-holidays-${year}`
  }
  // high-court (default)
  const slug = highCourtRegionSlug(courtName)
  return `/${slug}-high-court-holidays-${year}`
}

export function supremeCourtHubPath(): string {
  return '/supreme-court'
}

export function categoryListingPath(
  category: CourtCategory,
  page = 1,
): string {
  const base =
    category === 'high-court'
      ? '/high-courts'
      : category === 'district-court'
        ? '/district-courts'
        : category === 'tribunal'
          ? '/tribunals'
          : '/supreme-court'

  if (page <= 1) return base
  return `${base}/page/${page}`
}

export function statePath(stateSlug: string, year?: number): string {
  if (year != null) return `/states/${stateSlug}/holidays-${year}`
  return `/states/${stateSlug}`
}

export function yearHubPath(year: number): string {
  return `/years/${year}`
}

export function contactPath(): string {
  return '/contact'
}

export function absoluteUrl(path: string): string {
  if (!path || path === '/') return `${SITE_URL}/`
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * Find a court whose slug matches the route segment for a given category.
 */
export function findCourtBySlug(
  courts: { courtName: string }[],
  slug: string,
  category: CourtCategory,
): { courtName: string } | undefined {
  const needle = toSlug(slug)
  return courts.find((c) => {
    if (classifyCourtCategory(c.courtName) !== category) return false
    if (category === 'high-court') {
      return highCourtRegionSlug(c.courtName) === needle
    }
    if (category === 'district-court') {
      return districtCourtRegionSlug(c.courtName) === needle
    }
    return toSlug(c.courtName) === needle
  })
}

/** Parse `/delhi-high-court-holidays-2026` style paths. */
export function parseCourtHolidaySlug(
  pathSegment: string,
):
  | { kind: 'supreme'; year: number }
  | { kind: 'high-court'; slug: string; year: number }
  | { kind: 'district-court'; slug: string; year: number }
  | { kind: 'tribunal'; slug: string; year: number }
  | null {
  const sc = pathSegment.match(/^supreme-court-holidays-(\d{4})$/)
  if (sc) return { kind: 'supreme', year: Number(sc[1]) }

  const hc = pathSegment.match(/^(.+)-high-court-holidays-(\d{4})$/)
  if (hc) return { kind: 'high-court', slug: hc[1], year: Number(hc[2]) }

  const dc = pathSegment.match(/^(.+)-district-court-holidays-(\d{4})$/)
  if (dc) return { kind: 'district-court', slug: dc[1], year: Number(dc[2]) }

  const other = pathSegment.match(/^(.+)-holidays-(\d{4})$/)
  if (other) return { kind: 'tribunal', slug: other[1], year: Number(other[2]) }

  return null
}
