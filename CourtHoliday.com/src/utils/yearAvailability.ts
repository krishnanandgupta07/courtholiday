/**
 * Next-year holiday visibility gate.
 *
 * Concept:
 * - The API may already have holiday rows for the upcoming calendar year (e.g. 2027
 *   while we are still in 2026).
 * - We only expose that next year in the UI (year dropdown, SEO year links, URL
 *   selection) starting on 15 December of the current year.
 * - Past years and the current year are always selectable when present in the API.
 * - Years beyond "next year" stay hidden until they become the upcoming year and
 *   the 15 December gate opens.
 *
 * Example (today = 24 Jul 2026): years [2026, 2027] → dropdown shows only [2026].
 * Example (today = 15 Dec 2026): same API data → dropdown shows [2027, 2026].
 */

/** December is month index 11 (0-based). */
export const NEXT_YEAR_RELEASE_MONTH = 11

/** Inclusive: next year becomes available on this day of December. */
export const NEXT_YEAR_RELEASE_DAY = 15

/** True on/after 15 December of the current calendar year. */
export function isNextYearReleased(today: Date = new Date()): boolean {
  const month = today.getMonth()
  const day = today.getDate()
  return (
    month > NEXT_YEAR_RELEASE_MONTH ||
    (month === NEXT_YEAR_RELEASE_MONTH && day >= NEXT_YEAR_RELEASE_DAY)
  )
}

/** Whether a year may appear in selectors / be loaded from the UI. */
export function isYearSelectable(
  year: number,
  today: Date = new Date(),
): boolean {
  const currentYear = today.getFullYear()
  if (year <= currentYear) return true
  if (year === currentYear + 1) return isNextYearReleased(today)
  return false
}

/** Filter API/fallback year lists for UI + sitemap generation. */
export function filterSelectableYears(
  years: number[],
  today: Date = new Date(),
): number[] {
  return years
    .filter((year) => Number.isFinite(year) && isYearSelectable(year, today))
    .sort((a, b) => b - a)
}

/** If a URL/route year is not yet released, fall back to the current year. */
export function clampToSelectableYear(
  year: number,
  today: Date = new Date(),
): number {
  if (isYearSelectable(year, today)) return year
  return today.getFullYear()
}
