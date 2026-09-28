import type { BenchOption, CourtCategory } from '../types/api'
import { classifyCourtCategory } from './courtCategory'

/** Official Indian states/UTs — codes match backend `states.csv`. */
export const INDIA_STATES: { code: string; name: string }[] = [
  { code: 'AN', name: 'Andaman and Nicobar Islands' },
  { code: 'AP', name: 'Andhra Pradesh' },
  { code: 'AR', name: 'Arunachal Pradesh' },
  { code: 'AS', name: 'Assam' },
  { code: 'BR', name: 'Bihar' },
  { code: 'CH', name: 'Chandigarh' },
  { code: 'CG', name: 'Chhattisgarh' },
  { code: 'DH', name: 'Dadra and Nagar Haveli and Daman and Diu' },
  { code: 'DL', name: 'Delhi' },
  { code: 'GA', name: 'Goa' },
  { code: 'GJ', name: 'Gujarat' },
  { code: 'HR', name: 'Haryana' },
  { code: 'HP', name: 'Himachal Pradesh' },
  { code: 'JK', name: 'Jammu and Kashmir' },
  { code: 'JH', name: 'Jharkhand' },
  { code: 'KA', name: 'Karnataka' },
  { code: 'KL', name: 'Kerala' },
  { code: 'LA', name: 'Ladakh' },
  { code: 'LD', name: 'Lakshadweep' },
  { code: 'MP', name: 'Madhya Pradesh' },
  { code: 'MH', name: 'Maharashtra' },
  { code: 'MN', name: 'Manipur' },
  { code: 'ML', name: 'Meghalaya' },
  { code: 'MZ', name: 'Mizoram' },
  { code: 'NL', name: 'Nagaland' },
  { code: 'OD', name: 'Odisha' },
  { code: 'PY', name: 'Puducherry' },
  { code: 'PB', name: 'Punjab' },
  { code: 'RJ', name: 'Rajasthan' },
  { code: 'SK', name: 'Sikkim' },
  { code: 'TN', name: 'Tamil Nadu' },
  { code: 'TS', name: 'Telangana' },
  { code: 'TR', name: 'Tripura' },
  { code: 'UK', name: 'Uttarakhand' },
  { code: 'UP', name: 'Uttar Pradesh' },
  { code: 'WB', name: 'West Bengal' },
]

const STATE_NAME_BY_CODE = new Map(
  INDIA_STATES.map((state) => [state.code, state.name]),
)

/**
 * Punjab & Haryana High Court is stored under Punjab (`PB`) in benches.state_id,
 * but should also appear when Haryana (`HR`) is selected on the map.
 */
const PUNJAB_HARYANA_STATES = ['PB', 'HR'] as const

function isPunjabAndHaryanaCourt(courtName: string | undefined): boolean {
  const name = courtName?.toLowerCase() ?? ''
  return name.includes('punjab') && name.includes('haryana')
}

function sharedStateCodesForCourt(courtName: string | undefined): string[] {
  if (isPunjabAndHaryanaCourt(courtName)) return [...PUNJAB_HARYANA_STATES]
  return []
}

function isBenchVisibleInState(bench: BenchOption, stateCode: string): boolean {
  const benchState = normalizeStateCode(bench.stateCode)
  if (benchState === stateCode) return true
  const shared = sharedStateCodesForCourt(bench.courtName)
  return (
    shared.includes(stateCode) && Boolean(benchState && shared.includes(benchState))
  )
}

export function normalizeStateCode(
  code: string | null | undefined,
): string | null {
  const normalized = code?.trim().toUpperCase() ?? ''
  return normalized || null
}

export function getStateLabel(
  code: string | null | undefined,
  fallbackName?: string | null,
): string {
  const normalized = normalizeStateCode(code)
  if (!normalized) return fallbackName?.trim() || 'Unknown state'
  return STATE_NAME_BY_CODE.get(normalized) ?? fallbackName?.trim() ?? normalized
}

function matchesCategory(
  bench: BenchOption,
  category?: CourtCategory,
): boolean {
  if (!category) return true
  return classifyCourtCategory(bench.courtName ?? '') === category
}

function benchesInState(
  benches: BenchOption[],
  stateCode: string,
  category?: CourtCategory,
): BenchOption[] {
  const code = normalizeStateCode(stateCode)
  if (!code) return []
  return benches.filter((bench) => {
    if (!isBenchVisibleInState(bench, code)) return false
    return matchesCategory(bench, category)
  })
}

export function getStateCodesWithBenches(
  benches: BenchOption[],
  category?: CourtCategory,
): Set<string> {
  const codes = new Set<string>()
  for (const bench of benches) {
    if (!matchesCategory(bench, category)) continue
    const code = normalizeStateCode(bench.stateCode)
    if (code) codes.add(code)
    for (const extra of sharedStateCodesForCourt(bench.courtName)) {
      codes.add(extra)
    }
  }
  return codes
}

export function getCourtsInState(
  benches: BenchOption[],
  stateCode: string,
  category?: CourtCategory,
): string[] {
  const names = new Set<string>()
  for (const bench of benchesInState(benches, stateCode, category)) {
    const courtName = bench.courtName?.trim()
    if (courtName) names.add(courtName)
  }
  return [...names].sort((a, b) => a.localeCompare(b))
}

export function getBenchesInState(
  benches: BenchOption[],
  stateCode: string,
  courtName?: string,
  category?: CourtCategory,
): BenchOption[] {
  const court = courtName?.trim().toLowerCase()
  return benchesInState(benches, stateCode, category)
    .filter((bench) =>
      court ? (bench.courtName ?? '').trim().toLowerCase() === court : true,
    )
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function findStatesByQuery(query: string): { code: string; name: string }[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return INDIA_STATES
  return INDIA_STATES.filter(
    (state) =>
      state.name.toLowerCase().includes(needle) ||
      state.code.toLowerCase() === needle,
  )
}

export function getBenchStateCode(
  benches: BenchOption[],
  benchId: number | null,
): string | null {
  if (benchId == null) return null
  const bench = benches.find((item) => item.id === benchId)
  return normalizeStateCode(bench?.stateCode)
}
