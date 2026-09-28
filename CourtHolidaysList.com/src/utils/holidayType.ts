import type { HolidayType } from '../types/api'

/**
 * CourtLiveStream holidays have no type field. Classify from description:
 * Sunday, Saturday closures, local holidays, and winter holidays → restricted;
 * every other named day (Janmashtami, Vinayaka Chavithi, …) → gazetted / public.
 */
export function classifyHolidayType(description: string): HolidayType {
  const normalized = description.trim().toLowerCase()
  if (normalized.includes('sunday')) return 'restricted'
  if (normalized.includes('saturday')) return 'restricted'
  if (normalized.includes('local holiday')) return 'restricted'
  if (normalized.includes('winter holiday')) return 'restricted'
  return 'gazetted'
}

export function holidayTypeLabel(type: HolidayType): string {
  return type === 'gazetted' ? 'Public holiday' : 'Sunday / Saturday'
}
