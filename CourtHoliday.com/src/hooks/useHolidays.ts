import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  fetchCourtsList,
  fetchHolidays,
  fetchHolidaysByDate,
  fetchYears,
} from '../api/client'
import type { BenchOption, CourtOption, Holiday } from '../types/api'
import { todayKey, yearOptions } from '../utils/calendar'

interface AsyncState {
  loading: boolean
  error: string | null
}

const holidayCache = new Map<string, Holiday[]>()
const dateHolidayCache = new Map<string, Holiday[]>()

function cacheKey(benchId: number, year: number): string {
  return `${benchId}:${year}`
}

function pickDefaultYear(years: number[], currentYear: number): number {
  if (years.includes(currentYear)) return currentYear
  return years[0] ?? currentYear
}

export function useHolidays() {
  const currentYear = new Date().getFullYear()
  const [years, setYears] = useState<number[]>(() => yearOptions(currentYear))

  const [courts, setCourts] = useState<CourtOption[]>([])
  const [benchesByCourt, setBenchesByCourt] = useState<
    Record<string, BenchOption[]>
  >({})
  const [courtsState, setCourtsState] = useState<AsyncState>({
    loading: true,
    error: null,
  })

  const [selectedCourt, setSelectedCourt] = useState('')
  const [selectedBenchId, setSelectedBenchId] = useState<number | null>(null)
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [selectedDate, setSelectedDate] = useState(todayKey)

  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [holidaysState, setHolidaysState] = useState<AsyncState>({
    loading: false,
    error: null,
  })
  const [hasLoadedHolidays, setHasLoadedHolidays] = useState(false)
  const [viewLabel, setViewLabel] = useState<{
    court: string
    bench: string
    year: number
  } | null>(null)
  const [loadedDate, setLoadedDate] = useState<string | null>(null)

  const loadGeneration = useRef(0)

  const loadYears = useCallback(async () => {
    try {
      const result = await fetchYears()
      if (result.length === 0) return
      setYears(result)
      setSelectedYear((prev) =>
        result.includes(prev) ? prev : pickDefaultYear(result, currentYear),
      )
    } catch {
      // Keep local yearOptions fallback if the years endpoint is unavailable
    }
  }, [currentYear])

  const loadCourts = useCallback(async () => {
    setCourtsState({ loading: true, error: null })
    try {
      const result = await fetchCourtsList()
      setCourts(result.courts)
      setBenchesByCourt(result.benchesByCourt)
      setCourtsState({ loading: false, error: null })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load courts'
      setCourtsState({ loading: false, error: message })
    }
  }, [])

  useEffect(() => {
    void loadYears()
    void loadCourts()
  }, [loadCourts, loadYears])

  const benches = useMemo(
    () => (selectedCourt ? (benchesByCourt[selectedCourt] ?? []) : []),
    [benchesByCourt, selectedCourt],
  )

  const selectCourt = useCallback((courtName: string) => {
    setSelectedCourt(courtName)
    setSelectedBenchId(null)
  }, [])

  const loadHolidays = useCallback(async () => {
    if (!selectedCourt || selectedBenchId == null) {
      setHolidaysState({
        loading: false,
        error: 'Select a court and bench before viewing the calendar.',
      })
      return
    }

    const generation = ++loadGeneration.current
    const key = cacheKey(selectedBenchId, selectedYear)
    const benchName =
      benches.find((b) => b.id === selectedBenchId)?.name ?? 'Bench'

    setHolidaysState({ loading: true, error: null })

    try {
      let data = holidayCache.get(key)
      if (!data) {
        data = await fetchHolidays(selectedBenchId, selectedYear)
        holidayCache.set(key, data)
      }

      if (generation !== loadGeneration.current) return

      setHolidays(data)
      setHasLoadedHolidays(true)
      setLoadedDate(null)
      setViewLabel({
        court: selectedCourt,
        bench: benchName,
        year: selectedYear,
      })
      setHolidaysState({ loading: false, error: null })
    } catch (err) {
      if (generation !== loadGeneration.current) return
      const message =
        err instanceof Error ? err.message : 'Failed to load holidays'
      setHolidaysState({ loading: false, error: message })
    }
  }, [benches, selectedBenchId, selectedCourt, selectedYear])

  const loadHolidaysByDate = useCallback(async () => {
    if (!selectedDate) {
      setHolidaysState({
        loading: false,
        error: 'Select a date before viewing holidays.',
      })
      return
    }

    const generation = ++loadGeneration.current
    setHolidaysState({ loading: true, error: null })

    try {
      let data = dateHolidayCache.get(selectedDate)
      if (!data) {
        data = await fetchHolidaysByDate(selectedDate)
        dateHolidayCache.set(selectedDate, data)
      }

      if (generation !== loadGeneration.current) return

      setHolidays(data)
      setHasLoadedHolidays(true)
      setLoadedDate(selectedDate)
      setViewLabel(null)
      setHolidaysState({ loading: false, error: null })
    } catch (err) {
      if (generation !== loadGeneration.current) return
      const message =
        err instanceof Error ? err.message : 'Failed to load holidays'
      setHolidaysState({ loading: false, error: message })
    }
  }, [selectedDate])

  const retryHolidays = useCallback(() => {
    if (selectedBenchId != null) {
      holidayCache.delete(cacheKey(selectedBenchId, selectedYear))
    }
    void loadHolidays()
  }, [loadHolidays, selectedBenchId, selectedYear])

  const retryHolidaysByDate = useCallback(() => {
    dateHolidayCache.delete(selectedDate)
    void loadHolidaysByDate()
  }, [loadHolidaysByDate, selectedDate])

  const clearHolidayResults = useCallback(() => {
    loadGeneration.current += 1
    setHolidays([])
    setHasLoadedHolidays(false)
    setLoadedDate(null)
    setViewLabel(null)
    setHolidaysState({ loading: false, error: null })
  }, [])

  return {
    years,
    courts,
    benches,
    courtsState,
    reloadCourts: loadCourts,
    selectedCourt,
    selectCourt,
    selectedBenchId,
    setSelectedBenchId,
    selectedYear,
    setSelectedYear,
    selectedDate,
    setSelectedDate,
    holidays,
    holidaysState,
    hasLoadedHolidays,
    viewLabel,
    loadedDate,
    loadHolidays,
    loadHolidaysByDate,
    retryHolidays,
    retryHolidaysByDate,
    clearHolidayResults,
  }
}
