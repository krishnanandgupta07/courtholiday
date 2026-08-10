import type { ReactNode } from 'react'
import type { CourtCategory, ViewScope } from '../types/api'
import { COURT_CATEGORIES } from '../utils/courtCategory'

const COURTLIVESTREAM_URL =
  import.meta.env.VITE_COURTLIVESTREAM_URL?.trim() ||
  'https://www.courtlivestream.com'
const ANDROID_APP_URL =
  import.meta.env.VITE_ANDROID_APP_URL?.trim() ||
  'https://play.google.com/store/apps/details?id=com.courtlivestream.app&pcampaignid=web_share&pli=1'
const IOS_APP_URL =
  import.meta.env.VITE_IOS_APP_URL?.trim() ||
  'https://apps.apple.com/us/app/courtlive-stream/id6764580795'

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

function GooglePlayIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden
      fill="currentColor"
    >
      <path d="M3.609 1.814 13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92Zm10.89 10.893 2.302 2.302-10.937 6.333 8.635-8.635Zm3.199-3.198 2.307 1.335c.8.46.8 1.614 0 2.074l-2.305 1.334L15.028 12l2.67-2.491ZM5.864 2.658 16.8 8.99l-2.302 2.302-8.634-8.634Z" />
    </svg>
  )
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden
      fill="currentColor"
    >
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  )
}

function StoreBadge({
  href,
  label,
  sublabel,
  icon,
}: {
  href: string
  label: string
  sublabel: string
  icon: ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex min-h-8 items-center gap-1.5 rounded-sm border border-brassLight/40 bg-navyDeep/60 px-2 py-0.5 text-parchment transition hover:border-brassLight hover:bg-navyDeep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
    >
      {icon}
      <span className="flex flex-col leading-none">
        <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-brassLight/90">
          {sublabel}
        </span>
        <span className="mt-0.5 font-body text-[11px] font-semibold tracking-wide sm:text-xs">
          {label}
        </span>
      </span>
    </a>
  )
}

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
    <header className="relative sticky top-0 z-40 border-b border-brassLight/25 bg-masthead text-parchment shadow-slip">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.1]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 12% 40%, #D9C495 0%, transparent 42%), radial-gradient(circle at 88% 0%, #AD8A4E 0%, transparent 32%)',
        }}
        aria-hidden
      />

      <div className="relative flex w-full flex-wrap items-center gap-x-2 gap-y-1.5 px-3 py-1.5 sm:px-4 md:flex-nowrap md:gap-3 md:px-6 md:py-2 lg:px-8">
        {/* Brand + product attribution (industry standard: "Powered by …") */}
        <div className="flex min-w-0 shrink-0 items-center gap-2 md:gap-2.5">
          <button
            type="button"
            onClick={onHomeClick}
            className="flex shrink-0 items-center rounded-sm transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-1 focus-visible:ring-offset-navy"
            aria-label="Go to home page"
          >
            <img
              src="/images/CourtLiveLogo.jpeg"
              alt="CourtHoliday – Indian court holiday calendar logo"
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
              className="block truncate text-left font-display text-xs leading-tight tracking-tight text-parchment transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-1 focus-visible:ring-offset-navy sm:text-sm md:text-base"
            >
              Court Holidays Calendar
            </button>
            <p className="mt-0.5 truncate font-mono text-[8px] uppercase tracking-[0.12em] text-brassLight/90 sm:text-[9px]">
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
        <div className="order-3 flex w-full flex-col items-stretch gap-1 md:order-none md:mx-auto md:w-auto md:flex-1 md:items-center">
          <nav aria-label="Court type">
            <div
              className="flex w-full items-center justify-start gap-0.5 overflow-x-auto rounded-sm border border-brassLight/35 bg-navyDeep/45 p-0.5 md:mx-auto md:w-fit md:justify-center"
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
              className="flex w-full items-center justify-start gap-1 overflow-x-auto md:w-fit md:justify-center"
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

        {/* App download links + feature promo */}
        <div className="ml-auto flex shrink-0 items-center gap-2 md:ml-0 lg:gap-3">
          <a
            href={ANDROID_APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-8 items-center gap-1.5 rounded-sm border border-brass bg-brass px-2 py-1 font-body text-[11px] font-semibold text-navyDeep transition hover:bg-brassLight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brassLight focus-visible:ring-offset-2 focus-visible:ring-offset-navy lg:hidden"
          >
            <svg
              className="h-3.5 w-3.5"
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

          <div className="hidden flex-col items-end gap-1.5 lg:flex">
            <p className="max-w-[14rem] text-right font-body text-[10px] leading-snug text-parchment/80 xl:text-[11px]">
              Track Your Cases & get Alerts for Hearing Status
            </p>
            <div className="flex items-center gap-1.5">
              <StoreBadge
                href={IOS_APP_URL}
                sublabel="Download on the"
                label="App Store"
                icon={<AppleIcon className="h-4 w-4 text-brassLight" />}
              />
              <StoreBadge
                href={ANDROID_APP_URL}
                sublabel="Get it on"
                label="Google Play"
                icon={<GooglePlayIcon className="h-4 w-4 text-brassLight" />}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
