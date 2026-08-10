/** Raw bench object nested under each court in GET /api/app/courts/list */
export interface ApiBench {
  id: number
  name: string
  benchName: string
  benchType: string | null
}

/** Court group returned by GET /api/app/courts/list */
export interface ApiCourt {
  courtName: string
  benches: ApiBench[]
}

export interface CourtsListResponse {
  success: boolean
  data: ApiCourt[]
}

/** Single holiday row from GET /api/app/holidays?benchId=&year= */
export interface ApiHoliday {
  id: number
  benchId: number
  date: string // YYYY-MM-DD
  day: string
  description: string
  createdAt: string
  updatedAt: string
  bench: {
    id: number
    courtName: string
    benchName: string
  }
}

export interface HolidaysResponse {
  success: boolean
  data: ApiHoliday[]
}

/** GET /api/app/holidays/years — distinct years that have holiday rows */
export interface YearsResponse {
  success: boolean
  data: number[]
}

/** UI-facing holiday type (API has no type field — derived from description) */
export type HolidayType = 'gazetted' | 'restricted'

/** Calendar view modes — month/year use bench+year API; date uses date API */
export type ViewScope = 'month' | 'year' | 'date' | 'summary'

export interface Holiday {
  id: number
  date: string
  day: string
  name: string
  type: HolidayType
  /** Present on date-wise API rows (all courts for a date) */
  courtName?: string
  benchName?: string
  benchId?: number
}

export interface CourtOption {
  courtName: string
}

export interface BenchOption {
  id: number
  name: string
  benchType: string | null
}

/** Top-level court system filter (radio group under header) */
export type CourtCategory =
  | 'high-court'
  | 'supreme-court'
  | 'district-court'
  | 'tribunal'

/** POST /api/contact-us */
export interface ContactUsPayload {
  userId: number | null
  fullName: string
  phoneNumber: string
  emailAddress: string
  subject: string
  message: string
  /** Identifies which site/app sent the form, e.g. court-holidays */
  source: string
}

export interface ContactUsResponse {
  success: boolean
  message?: string
}

/** Year-specific official PDF from GET /api/courts/holiday-calendar-link/:benchId */
export interface HolidayCalendarYearLink {
  year: number
  link: string
}

/** GET /api/courts/holiday-calendar-link/:benchId */
export interface HolidayCalendarLinkData {
  id: number
  courtName: string
  benchName: string
  holidayCalendarLink: HolidayCalendarYearLink[]
  currentHolidayCalendarLink: string | null
}

export interface HolidayCalendarLinkResponse {
  success: boolean
  data: HolidayCalendarLinkData
}
