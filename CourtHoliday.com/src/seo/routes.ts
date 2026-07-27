/**
 * Route manifest helpers for sitemap generation and pagination.
 * Builds SEO paths dynamically from API court/year data.
 */
import type { CourtCategory, CourtOption } from '../types/api'
import { classifyCourtCategory } from '../utils/courtCategory'
import { COURTS_PER_PAGE } from './constants'
import {
  categoryListingPath,
  contactPath,
  courtHolidayPath,
  statePath,
  stateSlugFromCourt,
  supremeCourtHubPath,
  yearHubPath,
} from './slugs'

export interface SeoRouteEntry {
  path: string
  priority: number
  changefreq: 'weekly' | 'monthly' | 'yearly'
}

function uniquePaths(entries: SeoRouteEntry[]): SeoRouteEntry[] {
  const seen = new Set<string>()
  const out: SeoRouteEntry[] = []
  for (const entry of entries) {
    if (seen.has(entry.path)) continue
    seen.add(entry.path)
    out.push(entry)
  }
  return out
}

export function buildSeoRouteManifest(
  courts: CourtOption[],
  years: number[],
): SeoRouteEntry[] {
  const entries: SeoRouteEntry[] = [
    { path: '/', priority: 1.0, changefreq: 'weekly' },
    { path: contactPath(), priority: 0.6, changefreq: 'monthly' },
    { path: supremeCourtHubPath(), priority: 0.8, changefreq: 'weekly' },
  ]

  const categories: CourtCategory[] = [
    'high-court',
    'district-court',
    'tribunal',
  ]

  for (const category of categories) {
    const list = courts.filter(
      (c) => classifyCourtCategory(c.courtName) === category,
    )
    const pageCount = Math.max(1, Math.ceil(list.length / COURTS_PER_PAGE))
    for (let page = 1; page <= pageCount; page++) {
      entries.push({
        path: categoryListingPath(category, page),
        priority: page === 1 ? 0.8 : 0.6,
        changefreq: 'weekly',
      })
    }
  }

  const stateSlugs = new Map<string, string>()
  for (const court of courts) {
    const cat = classifyCourtCategory(court.courtName)
    if (cat !== 'high-court' && cat !== 'district-court') continue
    const slug = stateSlugFromCourt(court.courtName)
    if (!stateSlugs.has(slug)) {
      stateSlugs.set(slug, court.courtName)
    }
  }

  for (const [slug] of stateSlugs) {
    entries.push({
      path: statePath(slug),
      priority: 0.7,
      changefreq: 'weekly',
    })
    for (const year of years) {
      entries.push({
        path: statePath(slug, year),
        priority: 0.7,
        changefreq: 'weekly',
      })
    }
  }

  for (const year of years) {
    entries.push({
      path: yearHubPath(year),
      priority: 0.75,
      changefreq: 'weekly',
    })
  }

  for (const court of courts) {
    const category = classifyCourtCategory(court.courtName)
    for (const year of years) {
      entries.push({
        path: courtHolidayPath(court.courtName, year, category),
        priority: 0.9,
        changefreq: 'weekly',
      })
    }
  }

  return uniquePaths(entries)
}

export function paginateCourts<T>(items: T[], page: number): {
  pageItems: T[]
  page: number
  totalPages: number
} {
  const totalPages = Math.max(1, Math.ceil(items.length / COURTS_PER_PAGE))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * COURTS_PER_PAGE
  return {
    pageItems: items.slice(start, start + COURTS_PER_PAGE),
    page: safePage,
    totalPages,
  }
}
