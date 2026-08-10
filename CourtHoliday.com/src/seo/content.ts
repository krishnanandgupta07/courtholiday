/**
 * Central SEO content generator.
 * Produces title, description, keywords, H1, breadcrumbs, and FAQ from court/year context.
 * Single source of truth — pages and JSON-LD both consume this.
 */
import type { CourtCategory, Holiday } from '../types/api'
import { SITE_NAME } from './constants'
import {
  absoluteUrl,
  categoryListingPath,
  courtHolidayPath,
  statePath,
  stateSlugFromCourt,
} from './slugs'

export interface BreadcrumbItem {
  name: string
  path: string
}

export interface FaqItem {
  question: string
  answer: string
}

export interface SeoContent {
  title: string
  description: string
  keywords: string
  h1: string
  canonicalPath: string
  breadcrumbs: BreadcrumbItem[]
  faqs: FaqItem[]
}

function categoryLabel(category: CourtCategory): string {
  switch (category) {
    case 'supreme-court':
      return 'Supreme Court'
    case 'high-court':
      return 'High Courts'
    case 'district-court':
      return 'District Courts'
    case 'tribunal':
      return 'Tribunals'
  }
}

function categorySingular(category: CourtCategory): string {
  switch (category) {
    case 'supreme-court':
      return 'Supreme Court'
    case 'high-court':
      return 'High Court'
    case 'district-court':
      return 'District Court'
    case 'tribunal':
      return 'Tribunal'
  }
}

function todayISO(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatDisplayDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, (m ?? 1) - 1, d ?? 1)
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export interface CourtPageInput {
  courtName: string
  category: CourtCategory
  year: number
  benchName?: string | null
  holidays?: Holiday[]
}

/** SEO content for a specific court holiday list page. */
export function generateCourtPageSeo(input: CourtPageInput): SeoContent {
  const { courtName, category, year, benchName, holidays = [] } = input
  const path = courtHolidayPath(courtName, year, category)
  const listingPath = categoryListingPath(category)
  const stateSlug = stateSlugFromCourt(courtName)

  const title = `${courtName} Holiday List ${year} | ${SITE_NAME}`
  const description = `View and download the official ${courtName} Holiday List for ${year} including public holidays, court vacations and working days.${
    benchName ? ` Bench: ${benchName}.` : ''
  }`
  const keywords = [
    `${courtName.toLowerCase()} holidays ${year}`,
    `${courtName.toLowerCase()} holiday list`,
    `court holidays ${year}`,
    categorySingular(category).toLowerCase(),
    'court vacation',
    SITE_NAME.toLowerCase(),
  ].join(', ')

  const h1 = `${courtName} Holiday List ${year}`

  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Home', path: '/' },
    { name: categoryLabel(category), path: listingPath },
  ]
  if (category === 'high-court' || category === 'district-court') {
    breadcrumbs.push({
      name: courtName,
      path: statePath(stateSlug),
    })
  }
  breadcrumbs.push({ name: `Holiday List ${year}`, path })

  const today = todayISO()
  const upcoming = holidays
    .filter((h) => h.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
  const next = upcoming[0]
  const holidayToday = holidays.find((h) => h.date === today)

  const faqs: FaqItem[] = [
    {
      question: `When is the next ${courtName} holiday?`,
      answer: next
        ? `The next holiday is ${next.name} on ${formatDisplayDate(next.date)}.`
        : holidays.length > 0
          ? `There are no upcoming holidays listed for the rest of ${year}. Check earlier dates in the calendar above.`
          : `Load the ${year} calendar above to see the next holiday for ${courtName}.`,
    },
    {
      question: `How many holidays are there for ${courtName} in ${year}?`,
      answer:
        holidays.length > 0
          ? `${courtName} has ${holidays.length} holiday${holidays.length === 1 ? '' : 's'} listed for ${year}.`
          : `Open the holiday calendar above to see the full count of holidays for ${courtName} in ${year}.`,
    },
    {
      question: `Is ${courtName} open today?`,
      answer: holidayToday
        ? `No — today (${formatDisplayDate(today)}) is listed as a holiday: ${holidayToday.name}.`
        : `Based on the ${year} holiday list, today (${formatDisplayDate(today)}) is not marked as a court holiday. Confirm with the official court calendar for last-minute closures.`,
    },
    {
      question: `Where can I download the ${courtName} holiday PDF?`,
      answer: `Use the interactive holiday calendar on this page to view and print the ${courtName} holiday list for ${year}. Official PDFs, when published by the court, should be downloaded from the court's official website.`,
    },
  ]

  return {
    title,
    description,
    keywords,
    h1,
    canonicalPath: path,
    breadcrumbs,
    faqs,
  }
}

/** Home page SEO. */
export function generateHomeSeo(year = new Date().getFullYear()): SeoContent {
  return {
    title: `Court Holidays ${year} – Supreme Court, High Courts & District Court Holiday Calendar | ${SITE_NAME}`,
    description: `Find the latest court holidays in India for the Supreme Court, High Courts, District Courts and Tribunals. View holiday calendars, vacations and court closures for ${year}.`,
    keywords: `court holidays ${year}, supreme court holidays, high court holidays, district court holidays, court vacation, ${SITE_NAME.toLowerCase()}`,
    h1: `Indian Court Holiday Calendar ${year}`,
    canonicalPath: '/',
    breadcrumbs: [{ name: 'Home', path: '/' }],
    faqs: [
      {
        question: 'Which courts are covered on CourtHoliday?',
        answer:
          'CourtHoliday covers the Supreme Court of India, High Courts across states, District Courts, and Tribunals where holiday data is available.',
      },
      {
        question: 'How do I find holidays for a specific court?',
        answer:
          'Select the court category in the header, then choose the court, bench, and year. Or open a direct SEO page such as /delhi-high-court-holidays-2026.',
      },
      {
        question: 'Is the holiday list official?',
        answer:
          'Holiday dates are sourced from court holiday data published for each bench. Always verify critical filings against the official court notification.',
      },
      {
        question: 'Can I check if the court is open on a specific date?',
        answer:
          'Yes — use the Date view on the calendar to see which courts observe a holiday on any selected date.',
      },
    ],
  }
}

export function generateCategoryListingSeo(
  category: CourtCategory,
  page: number,
  year = new Date().getFullYear(),
): SeoContent {
  const label = categoryLabel(category)
  const path = categoryListingPath(category, page)
  const pageSuffix = page > 1 ? ` – Page ${page}` : ''
  return {
    title: `${label} Holiday Lists ${year}${pageSuffix} | ${SITE_NAME}`,
    description: `Browse ${label.toLowerCase()} holiday calendars for ${year}. Open the interactive calendar above, or pick any court below for vacations and public holidays.`,
    keywords: `${label.toLowerCase()} holidays ${year}, court holiday list, ${SITE_NAME.toLowerCase()}`,
    h1: `${label} Holiday Lists${pageSuffix}`,
    canonicalPath: path,
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: label, path: categoryListingPath(category) },
      ...(page > 1 ? [{ name: `Page ${page}`, path }] : []),
    ],
    faqs: [
      {
        question: `How do I view a ${categorySingular(category).toLowerCase()} holiday calendar?`,
        answer: `The calendar on this page opens a default court. Use the court selector, or choose another court from the directory below to open its ${year} holiday list.`,
      },
      {
        question: `How many ${label.toLowerCase()} are listed?`,
        answer: `Browse the paginated directory below. Each court links to its ${year} holiday calendar.`,
      },
    ],
  }
}

export function generateStateSeo(
  stateSlug: string,
  stateLabel: string,
  year?: number,
): SeoContent {
  const path = statePath(stateSlug, year)
  const yearPart = year != null ? ` ${year}` : ''
  return {
    title: `${stateLabel} Court Holidays${yearPart} | ${SITE_NAME}`,
    description: `View court holiday lists for ${stateLabel}${yearPart ? ` in ${year}` : ''}, including High Court and related courts.`,
    keywords: `${stateLabel.toLowerCase()} court holidays, ${stateSlug} high court holidays, ${SITE_NAME.toLowerCase()}`,
    h1: `${stateLabel} Court Holidays${yearPart}`,
    canonicalPath: path,
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'States', path: '/high-courts' },
      { name: stateLabel, path: statePath(stateSlug) },
      ...(year != null
        ? [{ name: `Holidays ${year}`, path }]
        : []),
    ],
    faqs: [
      {
        question: `Which courts serve ${stateLabel}?`,
        answer: `Use the links below to open High Court and related holiday calendars for ${stateLabel}.`,
      },
      {
        question: `Where is the ${stateLabel} High Court holiday list?`,
        answer: `Open the High Court holiday page linked from this state hub for the year you need.`,
      },
    ],
  }
}

export function generateYearHubSeo(year: number): SeoContent {
  const path = `/years/${year}`
  return {
    title: `Court Holidays ${year} – All Courts | ${SITE_NAME}`,
    description: `Explore Indian court holiday calendars for ${year} across the Supreme Court, High Courts, District Courts and Tribunals.`,
    keywords: `court holidays ${year}, high court holidays ${year}, supreme court holidays ${year}`,
    h1: `Court Holidays ${year}`,
    canonicalPath: path,
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: `Year ${year}`, path },
    ],
    faqs: [
      {
        question: `Which courts have holiday lists for ${year}?`,
        answer: `Browse the links below for courts with ${year} holiday data.`,
      },
    ],
  }
}

export function generateSupremeHubSeo(
  year = new Date().getFullYear(),
): SeoContent {
  return {
    title: `Supreme Court Holidays ${year} | ${SITE_NAME}`,
    description: `Supreme Court of India holiday calendar ${year} — view monthly and yearly holidays, vacations, and public holidays. Official PDF link included for verification.`,
    keywords:
      'supreme court holidays, supreme court of india holiday list, supreme court holiday calendar',
    h1: `Supreme Court of India Holiday List ${year}`,
    canonicalPath: '/supreme-court',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Supreme Court', path: '/supreme-court' },
    ],
    faqs: [
      {
        question: `Where is the Supreme Court holiday list for ${year}?`,
        answer: `The Supreme Court of India holiday calendar for ${year} is shown on this page. Use Month wise or Year wise view, and open the official PDF from the disclaimer strip when available.`,
      },
      {
        question: 'Does the Supreme Court observe summer and winter vacations?',
        answer:
          'Yes. The Supreme Court holiday list typically includes gazetted holidays and vacation periods. Check the calendar above for exact dates for the selected year.',
      },
    ],
  }
}

export function generateContactSeo(): SeoContent {
  return {
    title: `Contact Us | ${SITE_NAME}`,
    description:
      'Contact CourtHoliday for questions about court holiday calendars, data corrections, or partnership enquiries.',
    keywords: 'contact courtholiday, court holiday support',
    h1: 'Contact Us',
    canonicalPath: '/contact',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Contact', path: '/contact' },
    ],
    faqs: [],
  }
}

export function generateNotFoundSeo(): SeoContent {
  return {
    title: `Page Not Found | ${SITE_NAME}`,
    description: 'The page you requested could not be found on CourtHoliday.',
    keywords: '404, page not found',
    h1: 'Page Not Found',
    canonicalPath: '/',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Not Found', path: '/' },
    ],
    faqs: [],
  }
}

/** Absolute canonical URL helper for meta tags. */
export function canonicalFromPath(path: string): string {
  return absoluteUrl(path)
}
