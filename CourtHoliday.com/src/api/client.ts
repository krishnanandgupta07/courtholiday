import type {
  ApiBench,
  ApiHoliday,
  BenchOption,
  ContactUsPayload,
  ContactUsResponse,
  CourtOption,
  CourtsListResponse,
  Holiday,
  HolidayCalendarLinkData,
  HolidayCalendarLinkResponse,
  HolidaysResponse,
  YearsResponse,
} from '../types/api'
import { classifyHolidayType } from '../utils/holidayType'

const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ??
  'https://api.courtlivestream.com'

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`)
  }
  return response.json() as Promise<T>
}

function mapBench(courtName: string, bench: ApiBench): BenchOption {
  const stateCode = bench.stateCode?.trim().toUpperCase() || null
  return {
    id: bench.id,
    name: bench.benchName || bench.name,
    benchType: bench.benchType,
    courtName,
    stateId: bench.stateId ?? null,
    stateName: bench.stateName ?? null,
    stateCode,
    districtId: bench.districtId ?? null,
    districtName: bench.districtName ?? null,
  }
}

/** API call #1 — load courts and nested benches on mount */
export async function fetchCourtsList(): Promise<{
  courts: CourtOption[]
  benchesByCourt: Record<string, BenchOption[]>
  benches: BenchOption[]
}> {
  // GET https://api.courtlivestream.com/api/app/courts/list
  const payload = await fetchJson<CourtsListResponse>(
    `${API_BASE}/api/app/courts/list`,
  )

  if (!payload.success || !Array.isArray(payload.data)) {
    throw new Error('Unexpected courts list response')
  }

  const courts: CourtOption[] = []
  const benchesByCourt: Record<string, BenchOption[]> = {}
  const benches: BenchOption[] = []

  for (const court of payload.data) {
    courts.push({ courtName: court.courtName })
    const mapped = (court.benches ?? []).map((bench) =>
      mapBench(court.courtName, bench),
    )
    benchesByCourt[court.courtName] = mapped
    benches.push(...mapped)
  }

  courts.sort((a, b) => a.courtName.localeCompare(b.courtName))
  benches.sort((a, b) => a.name.localeCompare(b.name))
  for (const key of Object.keys(benchesByCourt)) {
    benchesByCourt[key].sort((a, b) => a.name.localeCompare(b.name))
  }

  return { courts, benchesByCourt, benches }
}

function mapHoliday(raw: ApiHoliday): Holiday {
  return {
    id: raw.id,
    date: raw.date,
    day: raw.day,
    name: raw.description,
    type: classifyHolidayType(raw.description),
    courtName: raw.bench?.courtName,
    benchName: raw.bench?.benchName,
    benchId: raw.benchId ?? raw.bench?.id,
  }
}

/** Distinct years that have holidays in the database */
export async function fetchYears(): Promise<number[]> {
  // GET https://api.courtlivestream.com/api/app/holidays/years
  const payload = await fetchJson<YearsResponse>(
    `${API_BASE}/api/app/holidays/years`,
  )

  if (!payload.success || !Array.isArray(payload.data)) {
    throw new Error('Unexpected years response')
  }

  return payload.data
    .map((year) => Number(year))
    .filter((year) => Number.isFinite(year))
    .sort((a, b) => b - a)
}

/** API call #2 — load holidays for selected bench + year (month / year views) */
export async function fetchHolidays(
  benchId: number,
  year: number,
): Promise<Holiday[]> {
  // GET https://api.courtlivestream.com/api/app/holidays?benchId={}&year={}
  const params = new URLSearchParams({
    benchId: String(benchId),
    year: String(year),
  })
  const payload = await fetchJson<HolidaysResponse>(
    `${API_BASE}/api/app/holidays?${params}`,
  )

  if (!payload.success || !Array.isArray(payload.data)) {
    throw new Error('Unexpected holidays response')
  }

  return payload.data
    .map(mapHoliday)
    .sort((a, b) => a.date.localeCompare(b.date))
}

/** API call #3 — load holidays across courts for a single date */
export async function fetchHolidaysByDate(date: string): Promise<Holiday[]> {
  // GET https://api.courtlivestream.com/api/app/holidays?date=YYYY-MM-DD
  const params = new URLSearchParams({ date })
  const payload = await fetchJson<HolidaysResponse>(
    `${API_BASE}/api/app/holidays?${params}`,
  )

  if (!payload.success || !Array.isArray(payload.data)) {
    throw new Error('Unexpected holidays response')
  }

  return payload.data
    .map(mapHoliday)
    .sort((a, b) => {
      const courtCmp = (a.courtName ?? '').localeCompare(b.courtName ?? '')
      if (courtCmp !== 0) return courtCmp
      return (a.benchName ?? '').localeCompare(b.benchName ?? '')
    })
}

/**
 * Official court holiday calendar PDF for a bench.
 * GET https://api.courtlivestream.com/api/courts/holiday-calendar-link/{benchId}
 */
export async function fetchHolidayCalendarLink(
  benchId: number,
): Promise<HolidayCalendarLinkData> {
  const payload = await fetchJson<HolidayCalendarLinkResponse>(
    `${API_BASE}/api/courts/holiday-calendar-link/${benchId}`,
  )

  if (!payload.success || !payload.data) {
    throw new Error('Unexpected holiday calendar link response')
  }

  return payload.data
}

/** Prefer the PDF for `year`, otherwise the API's current link. */
export function resolveHolidayCalendarPdfUrl(
  data: HolidayCalendarLinkData,
  year: number,
): string | null {
  const forYear = data.holidayCalendarLink?.find((item) => item.year === year)
  const url = forYear?.link?.trim() || data.currentHolidayCalendarLink?.trim()
  return url || null
}

/** POST https://api.courtlivestream.com/api/contact-us */
export async function submitContactUs(
  payload: ContactUsPayload,
): Promise<ContactUsResponse> {
  const response = await fetch(`${API_BASE}/api/contact-us`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  let body: ContactUsResponse | null = null
  try {
    body = (await response.json()) as ContactUsResponse
  } catch {
    body = null
  }

  if (!response.ok) {
    throw new Error(
      body?.message?.trim() || `Request failed (${response.status})`,
    )
  }

  if (body && body.success === false) {
    throw new Error(body.message?.trim() || 'Failed to submit contact form')
  }

  return (
    body ?? {
      success: true,
      message: 'Your message has been sent successfully.',
    }
  )
}
