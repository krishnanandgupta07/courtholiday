import type { HolidayType } from '../types/api'

/**
 * CourtLiveStream holidays have no type field. Classify from description:
 * Sunday, any Saturday closure, local holiday, and winter holiday → restricted.
 * Named days (Janmashtami, Vinayaka Chavithi, Samvatsari, …) → gazetted / public.
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
