import type { CourtCategory, CourtOption } from '../types/api'

export const COURT_CATEGORIES: {
  id: CourtCategory
  label: string
}[] = [
  { id: 'supreme-court', label: 'Supreme Court' },
  { id: 'high-court', label: 'High Court' },
  { id: 'district-court', label: 'District Court' },
  { id: 'tribunal', label: 'Tribunals Courts' },
]

/** Classify a court name into High Court / Supreme Court / District / Tribunal */
export function classifyCourtCategory(courtName: string): CourtCategory {
  const name = courtName.trim().toLowerCase()

  if (name.includes('supreme court')) return 'supreme-court'
  if (name.includes('tribunal') || name.includes('board') || name.includes('commission')) {
    return 'tribunal'
  }
  if (
    name.includes('district court') ||
    name.includes('district & sessions') ||
    name.includes('sessions court') ||
    name.includes('city civil')
  ) {
    return 'district-court'
  }
  if (name.includes('high court')) return 'high-court'

  // Default remaining CourtLiveStream entries are High Courts
  return 'high-court'
}

export function filterCourtsByCategory(
  courts: CourtOption[],
  category: CourtCategory,
): CourtOption[] {
  return courts.filter(
    (court) => classifyCourtCategory(court.courtName) === category,
  )
}

export function filterHolidayCourtName(
  courtName: string | undefined,
  category: CourtCategory,
): boolean {
  if (!courtName) return category === 'high-court'
  return classifyCourtCategory(courtName) === category
}
