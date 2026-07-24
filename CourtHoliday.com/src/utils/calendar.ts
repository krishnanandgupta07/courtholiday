import type { Holiday } from '../types/api'

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

export function toDateKey(year: number, month: number, day: number): string {
  const mm = String(month + 1).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

export function parseDateKey(date: string): Date {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatLongDate(date: string): string {
  return parseDateKey(date).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatMonthYear(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  })
}

export function todayKey(): string {
  const now = new Date()
  return toDateKey(now.getFullYear(), now.getMonth(), now.getDate())
}

export function buildHolidayMap(
  holidays: Holiday[],
): Map<string, Holiday[]> {
  const map = new Map<string, Holiday[]>()
  for (const holiday of holidays) {
    const existing = map.get(holiday.date) ?? []
    existing.push(holiday)
    map.set(holiday.date, existing)
  }
  return map
}

export interface CalendarCell {
  key: string
  day: number | null
  inMonth: boolean
  holidays: Holiday[]
  isToday: boolean
}

/** Build a Sun–Sat grid for the given month, padded with empty leading/trailing cells */
export function buildMonthGrid(
  year: number,
  month: number,
  holidayMap: Map<string, Holiday[]>,
): CalendarCell[] {
  const first = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startWeekday = first.getDay()
  const today = todayKey()
  const cells: CalendarCell[] = []

  for (let i = 0; i < startWeekday; i += 1) {
    cells.push({
      key: `pad-start-${i}`,
      day: null,
      inMonth: false,
      holidays: [],
      isToday: false,
    })
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = toDateKey(year, month, day)
    cells.push({
      key,
      day,
      inMonth: true,
      holidays: holidayMap.get(key) ?? [],
      isToday: key === today,
    })
  }

  while (cells.length % 7 !== 0) {
    cells.push({
      key: `pad-end-${cells.length}`,
      day: null,
      inMonth: false,
      holidays: [],
      isToday: false,
    })
  }

  return cells
}

export function yearOptions(center = new Date().getFullYear()): number[] {
  return [center - 2, center - 1, center, center + 1, center + 2]
}

export function formatMonthName(month: number): string {
  return new Date(2000, month, 1).toLocaleDateString('en-IN', { month: 'long' })
}

export function formatMonthShort(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString('en-IN', { month: 'short' })
}

export function filterHolidaysByMonth(
  holidays: Holiday[],
  year: number,
  month: number,
): Holiday[] {
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}-`
  return holidays
    .filter((h) => h.date.startsWith(prefix))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/** First list item to show in month view — today or next upcoming holiday */
export function getMonthListScrollAnchor(
  holidays: Holiday[],
  year: number,
  month: number,
): string | null {
  if (holidays.length === 0) return null

  const today = todayKey()
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}-`
  const inMonth = holidays.filter((h) => h.date.startsWith(prefix))
  if (inMonth.length === 0) return null

  const lastDay = new Date(year, month + 1, 0).getDate()
  const monthStart = `${prefix}01`
  const monthEnd = `${prefix}${String(lastDay).padStart(2, '0')}`

  if (monthEnd < today || monthStart > today) {
    return inMonth[0].date
  }

  const upcoming = inMonth.find((h) => h.date >= today)
  return upcoming?.date ?? inMonth[inMonth.length - 1].date
}

export function defaultViewMonth(year: number): number {
  const now = new Date()
  return year === now.getFullYear() ? now.getMonth() : 0
}
