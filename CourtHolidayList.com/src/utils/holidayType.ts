import type { HolidayType } from '../types/api'

const RESTRICTED_EXACT = new Set([
  'sunday',
  'second saturday',
  'local holiday',
])

/**
 * CourtLiveStream holidays have no type field. Classify from description:
 * routine closures / local holidays → restricted; named gazetted days → gazetted.
 */
export function classifyHolidayType(description: string): HolidayType {
  const normalized = description.trim().toLowerCase()
  if (RESTRICTED_EXACT.has(normalized)) return 'restricted'
  if (normalized.includes('local holiday')) return 'restricted'
  if (normalized.startsWith('winter holiday')) return 'restricted'
  return 'gazetted'
}

export function holidayTypeLabel(type: HolidayType): string {
  return type === 'gazetted' ? 'Gazetted' : 'Restricted'
}
