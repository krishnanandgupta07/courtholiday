import type { HolidayType } from '../types/api'

const RESTRICTED_EXACT = new Set([
  'sunday',
  'second saturday',
  'non-working saturday',
  'local holiday',
])

/**
 * CourtLiveStream holidays have no type field. Classify from description:
 * weekly closures / local holidays → restricted; named public holidays → gazetted.
 */
export function classifyHolidayType(description: string): HolidayType {
  const normalized = description.trim().toLowerCase()
  if (RESTRICTED_EXACT.has(normalized)) return 'restricted'
  if (normalized.includes('local holiday')) return 'restricted'
  if (normalized.startsWith('winter holiday')) return 'restricted'
  if (normalized.includes('saturday')) return 'restricted'
  return 'gazetted'
}

export function holidayTypeLabel(type: HolidayType): string {
  return type === 'gazetted' ? 'Public holiday' : 'Sunday / Saturday'
}
