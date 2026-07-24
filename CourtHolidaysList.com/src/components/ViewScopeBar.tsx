import type { ViewScope } from '../types/api'

const VIEW_TABS: {
  id: ViewScope
  label: string
  shortLabel: string
  hint: string
}[] = [
  {
    id: 'month',
    label: 'Month wise',
    shortLabel: 'Month',
    hint: 'View one month at a time',
  },
  {
    id: 'year',
    label: 'Year wise',
    shortLabel: 'Year',
    hint: 'View the full year calendar',
  },
  {
    id: 'date',
    label: 'Date wise',
    shortLabel: 'Date',
    hint: 'Look up holidays for a specific date',
  },
  {
    id: 'summary',
    label: 'Summary',
    shortLabel: 'Summary',
    hint: 'Coming soon',
  },
]

interface ViewScopeBarProps {
  value: ViewScope
  onChange: (scope: ViewScope) => void
}

/** Second header row: Month / Year / Date / Summary */
export function ViewScopeBar({ value, onChange }: ViewScopeBarProps) {
  return (
    <div className="border-b border-brassLight/25 bg-navyDeep/95 text-parchment">
      <div className="flex w-full items-center px-3 py-1.5 sm:px-4 md:px-6 lg:px-8">
        <nav className="w-full" aria-label="Calendar view modes">
          <div
            className="flex w-full items-center justify-start gap-1.5 overflow-x-auto sm:gap-2"
            role="tablist"
          >
            {VIEW_TABS.map((tab) => {
              const active = value === tab.id
              const isSummary = tab.id === 'summary'
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  title={tab.hint}
                  aria-label={tab.hint}
                  aria-selected={isSummary ? false : active}
                  aria-disabled={isSummary || undefined}
                  onClick={() => {
                    if (isSummary) return
                    onChange(tab.id)
                  }}
                  className={[
                    'inline-flex min-h-8 shrink-0 items-center rounded-sm border px-2.5 py-1 font-body text-[11px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass sm:text-xs',
                    isSummary
                      ? 'cursor-not-allowed border-brassLight/20 bg-navy/20 text-parchment/40'
                      : active
                        ? 'border-brass bg-brass text-navyDeep'
                        : 'border-brassLight/35 bg-navy/40 text-parchment/85 hover:border-brassLight/60 hover:bg-navy/70',
                  ].join(' ')}
                >
                  <span className="sm:hidden">{tab.shortLabel}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
