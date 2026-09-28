import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { BenchOption, CourtCategory } from '../types/api'
import {
  getBenchStateCode,
  getBenchesInState,
  getCourtsInState,
  getStateCodesWithBenches,
  getStateLabel,
  INDIA_STATES,
} from '../utils/benchesByState'
import { IndiaMap } from './india-map/IndiaMap'

interface CourtMapPickerProps {
  benches: BenchOption[]
  category: CourtCategory
  selectedCourt: string
  selectedBenchId: number | null
  onSelect: (courtName: string, benchId: number) => void
  onClose: () => void
}

type MapPopup =
  | { type: 'empty'; stateCode: string }
  | { type: 'courts'; stateCode: string; courts: string[] }
  | { type: 'benches'; stateCode: string; courtName: string }

const selectClass =
  'w-full min-h-9 rounded-sm border border-brassLight/70 bg-parchment px-2.5 py-1.5 font-body text-sm text-ink shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-parchment'

export function CourtMapPicker({
  benches,
  category,
  selectedCourt,
  selectedBenchId,
  onSelect,
  onClose,
}: CourtMapPickerProps) {
  const titleId = useId()
  const popupTitleId = useId()
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const availableCodes = useMemo(
    () => getStateCodesWithBenches(benches, category),
    [benches, category],
  )

  const initialState =
    getBenchStateCode(benches, selectedBenchId) ??
    (availableCodes.has('TS') ? 'TS' : [...availableCodes][0] ?? 'TS')

  const [stateCode, setStateCode] = useState(initialState)
  const [popup, setPopup] = useState<MapPopup | null>(null)

  const popupBenches = useMemo(
    () =>
      popup?.type === 'benches'
        ? getBenchesInState(benches, popup.stateCode, popup.courtName, category)
        : [],
    [benches, category, popup],
  )

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    closeBtnRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus?.()
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (popup) {
        event.stopPropagation()
        setPopup(null)
        return
      }
      onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose, popup])

  const applyCourt = (code: string, courtName: string) => {
    const courtBenches = getBenchesInState(benches, code, courtName, category)
    if (courtBenches.length === 1) {
      onSelect(courtName, courtBenches[0].id)
      return
    }
    if (courtBenches.length > 1) {
      setPopup({ type: 'benches', stateCode: code, courtName })
    }
  }

  const handleStatePick = (nextCode: string) => {
    setStateCode(nextCode)
    const courts = getCourtsInState(benches, nextCode, category)
    if (courts.length === 0) {
      setPopup({ type: 'empty', stateCode: nextCode })
      return
    }
    if (courts.length === 1) {
      applyCourt(nextCode, courts[0])
      return
    }
    setPopup({ type: 'courts', stateCode: nextCode, courts })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navyDeep/55 p-3 sm:p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !popup) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[min(94vh,54rem)] w-full max-w-4xl flex-col overflow-hidden border border-brassLight/50 bg-parchment shadow-slip"
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-brassLight/40 px-4 py-3 sm:px-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-brass">
              Select a court
            </p>
            <h2
              id={titleId}
              className="mt-0.5 font-display text-xl text-navy sm:text-2xl"
            >
              Choose from the India map
            </h2>
            <p className="mt-1 font-body text-xs text-inkSoft">
              Click a state to open its holiday calendar.
            </p>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-sm border border-brassLight/60 bg-parchment px-2 font-body text-sm text-navy transition hover:bg-parchmentDim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
            aria-label="Close map picker"
          >
            Close
          </button>
        </header>

        <section aria-label="India map" className="relative min-h-0 flex-1 px-3 py-3 sm:px-4">
          <label className="mb-2 block max-w-sm">
            <span className="mb-1 block font-body text-[11px] font-medium uppercase tracking-wide text-inkSoft">
              Jump to state
            </span>
            <select
              className={selectClass}
              value={stateCode}
              onChange={(event) => handleStatePick(event.target.value)}
            >
              {INDIA_STATES.map((state) => (
                <option key={state.code} value={state.code}>
                  {state.name}
                  {availableCodes.has(state.code) ? '' : ' — no courts yet'}
                </option>
              ))}
            </select>
          </label>

          <div className="max-h-[min(72vh,40rem)] overflow-auto">
            <IndiaMap
              selectedCode={stateCode}
              availableCodes={availableCodes}
              onSelect={handleStatePick}
            />
          </div>

          {popup ? (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center bg-navyDeep/45 p-3 sm:p-4"
              role="presentation"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setPopup(null)
              }}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={popupTitleId}
                className="flex max-h-full w-full max-w-sm flex-col overflow-hidden border border-brassLight/50 bg-parchment shadow-slip"
              >
                <header className="flex items-start justify-between gap-3 border-b border-brassLight/40 px-4 py-3">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-brass">
                      {popup.type === 'benches'
                        ? 'Choose a bench'
                        : popup.type === 'courts'
                          ? 'Choose a court'
                          : getStateLabel(popup.stateCode)}
                    </p>
                    <h3
                      id={popupTitleId}
                      className="mt-0.5 font-display text-lg text-navy"
                    >
                      {popup.type === 'benches'
                        ? popup.courtName
                        : popup.type === 'courts'
                          ? getStateLabel(popup.stateCode)
                          : 'No holiday calendar'}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPopup(null)}
                    className="inline-flex min-h-9 items-center justify-center rounded-sm border border-brassLight/60 px-2 font-body text-sm text-navy hover:bg-parchmentDim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
                  >
                    Back
                  </button>
                </header>

                {popup.type === 'empty' ? (
                  <p className="px-4 py-4 font-body text-sm leading-relaxed text-inkSoft">
                    No holiday calendar for {getStateLabel(popup.stateCode)} yet.
                  </p>
                ) : null}

                {popup.type === 'courts' ? (
                  <ul className="min-h-0 flex-1 overflow-y-auto p-2">
                    {popup.courts.map((courtName) => {
                      const active = courtName === selectedCourt
                      return (
                        <li key={courtName}>
                          <button
                            type="button"
                            onClick={() => applyCourt(popup.stateCode, courtName)}
                            className={[
                              'mb-1 flex w-full items-start rounded-sm px-3 py-2.5 text-left font-body text-sm font-semibold last:mb-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass',
                              active
                                ? 'bg-navy text-parchment'
                                : 'text-navy hover:bg-parchmentDim',
                            ].join(' ')}
                          >
                            {courtName}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                ) : null}

                {popup.type === 'benches' ? (
                  <ul className="min-h-0 flex-1 overflow-y-auto p-2">
                    {popupBenches.map((bench) => {
                      const active = bench.id === selectedBenchId
                      return (
                        <li key={bench.id}>
                          <button
                            type="button"
                            onClick={() => onSelect(popup.courtName, bench.id)}
                            className={[
                              'mb-1 flex w-full flex-col items-start rounded-sm px-3 py-2.5 text-left font-body text-sm last:mb-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass',
                              active
                                ? 'bg-navy text-parchment'
                                : 'text-ink hover:bg-parchmentDim',
                            ].join(' ')}
                          >
                            <span className="font-medium">{bench.name}</span>
                            {bench.benchType ? (
                              <span
                                className={
                                  active
                                    ? 'text-[11px] text-brassLight'
                                    : 'text-[11px] text-inkSoft'
                                }
                              >
                                {bench.benchType}
                              </span>
                            ) : null}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                ) : null}
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  )
}
