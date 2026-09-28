import type { CourtCategory, ViewScope } from '../types/api'
import { COURT_CATEGORIES } from '../utils/courtCategory'
import { ANDROID_APP_URL, StoreBadgePair } from './StoreBadges'

const COURTLIVESTREAM_URL =
  import.meta.env.VITE_COURTLIVESTREAM_URL?.trim() ||
  'https://www.courtlivestream.com'
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

interface AppHeaderProps {
  courtCategory: CourtCategory
  onCourtCategoryChange: (category: CourtCategory) => void
  viewScope: ViewScope
  onViewScopeChange: (scope: ViewScope) => void
  onHomeClick?: () => void
}

export function AppHeader({
  courtCategory,
  onCourtCategoryChange,
  viewScope,
  onViewScopeChange,
  onHomeClick,
}: AppHeaderProps) {
  return (
    <header className="relative z-40 border-b border-brassLight/25 bg-masthead text-parchment shadow-slip md:sticky md:top-0">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.1]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 12% 40%, #D9C495 0%, transparent 42%), radial-gradient(circle at 88% 0%, #AD8A4E 0%, transparent 32%)',
        }}
        aria-hidden
      />

      <div className="relative flex w-full flex-wrap items-center gap-x-2 gap-y-1 px-2.5 py-1 sm:gap-y-1.5 sm:px-4 sm:py-1.5 md:gap-3 md:px-6 md:py-2 lg:flex-nowrap lg:px-8">
        {/* Brand + product attribution (industry standard: "Powered by …") */}
        <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2 lg:flex-none lg:gap-2.5">
          <button
            type="button"
            onClick={onHomeClick}
            className="flex shrink-0 items-center rounded-sm transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-1 focus-visible:ring-offset-navy"
            aria-label="Go to home page"
          >
            <img
              src="/images/CourtLiveLogo.jpeg"
              alt="CourtHolidayList – Indian court holiday calendar logo"
              className="h-5 w-auto shrink-0 rounded-sm border border-brassLight/30 bg-parchment object-contain shadow-sm sm:h-6"
              width={60}
              height={24}
              loading="eager"
              decoding="async"
            />
          </button>
          <div className="min-w-0">
            {/* Brand label is not the page H1 — page wrappers own a single H1 for SEO hierarchy */}
            <button
              type="button"
              onClick={onHomeClick}
              className="block max-w-[11rem] truncate text-left font-display text-[11px] leading-tight tracking-tight text-parchment transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-1 focus-visible:ring-offset-navy sm:max-w-none sm:text-sm md:text-base"
            >
              Court Holidays Calendar
            </button>
            <p className="mt-0.5 truncate font-mono text-[7px] uppercase tracking-[0.1em] text-brassLight/90 sm:text-[9px] sm:tracking-[0.12em]">
              Powered by{' '}
              <a
                href={COURTLIVESTREAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brassLight underline-offset-2 transition hover:text-brass hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass"
                aria-label="Visit CourtLiveStream website"
              >
                CourtLiveStream
              </a>
            </p>
          </div>
        </div>

        {/* Court type + view scope stacked and centered under each other */}
        <div className="order-3 flex w-full min-w-0 flex-col items-stretch gap-1 lg:order-none lg:mx-auto lg:w-auto lg:flex-1 lg:items-center">
          <nav aria-label="Court type">
            <div
              className="flex w-full items-center justify-start gap-0.5 overflow-x-auto rounded-sm border border-brassLight/35 bg-navyDeep/45 p-0.5 lg:mx-auto lg:w-fit lg:justify-center"
              role="radiogroup"
              aria-label="Court type"
            >
              {COURT_CATEGORIES.map((option) => {
                const active = courtCategory === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    title={option.label}
                    onClick={() => onCourtCategoryChange(option.id)}
                    className={[
                      'min-h-8 shrink-0 whitespace-nowrap rounded-sm px-2 py-1 font-body text-[11px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-1 focus-visible:ring-offset-navy sm:px-2.5 sm:text-xs',
                      active
                        ? 'bg-brass text-navyDeep shadow-sm'
                        : 'text-parchment/75 hover:bg-white/5 hover:text-parchment',
                    ].join(' ')}
                  >
                    <span className="sm:hidden">
                      {option.id === 'high-court'
                        ? 'HC'
                        : option.id === 'supreme-court'
                          ? 'SC'
                          : option.id === 'district-court'
                            ? 'District'
                            : 'Tribunal'}
                    </span>
                    <span className="hidden sm:inline">{option.label}</span>
                  </button>
                )
              })}
            </div>
          </nav>

          {/* Month / Year / Date / Summary — directly under court tabs */}
          <nav aria-label="Calendar view modes">
            <div
              className="flex w-full items-center justify-start gap-1 overflow-x-auto lg:w-fit lg:justify-center"
              role="tablist"
            >
              {VIEW_TABS.map((tab) => {
                const active = viewScope === tab.id
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
                      onViewScopeChange(tab.id)
                    }}
                    className={[
                      'inline-flex min-h-7 shrink-0 items-center rounded-sm border px-2 py-0.5 font-body text-[10px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass sm:min-h-8 sm:px-2.5 sm:text-[11px]',
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

        {/* App download — compact button below lg; badge cluster on desktop */}
        <div className="ml-auto flex shrink-0 items-center lg:ml-0">
          <a
            href={ANDROID_APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="app-get-app-btn relative inline-flex min-h-8 shrink-0 items-center gap-1 rounded-sm border border-brassLight bg-brass px-1.5 py-1 font-body text-[10px] font-semibold text-navyDeep transition hover:bg-brassLight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brassLight focus-visible:ring-offset-2 focus-visible:ring-offset-navy sm:gap-1.5 sm:px-2 sm:text-[11px] lg:hidden"
            aria-label="Get the CourtLiveStream app"
          >
            <span
              className="app-promo-live-dot absolute -right-1 -top-1 h-2 w-2 rounded-full bg-brassLight"
              aria-hidden
            />
            <svg
              className="app-promo-icon h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"
              />
            </svg>
            Get App
          </a>

          <div className="app-promo-cluster hidden flex-col items-end gap-1.5 rounded-sm border border-brass/55 bg-navyDeep/70 px-2 py-1.5 lg:flex">
            <p className="flex max-w-[15rem] items-center gap-1.5 text-right font-body text-[10px] leading-snug text-parchment xl:text-[11px]">
              <span
                className="app-promo-live-dot h-1.5 w-1.5 shrink-0 rounded-full bg-brassLight"
                aria-hidden
              />
              <span>Get the app — track cases & hearing alerts</span>
            </p>
            <StoreBadgePair />
          </div>
        </div>
      </div>
    </header>
  )
}
