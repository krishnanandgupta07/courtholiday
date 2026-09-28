/**
 * Full-width app download strip.
 * Last child of the page content wrapper (footer is a sibling after that wrapper),
 * so sticky bottom stays above Corporate Office / contact and never covers it.
 * Mobile: in-flow. md+: sticky to the viewport bottom while the wrapper is on screen.
 */
import { StoreBadgeRow } from './StoreBadges'

export function AppDownloadBanner({ className = '' }: { className?: string }) {
  return (
    <aside
      aria-label="Download CourtLiveStream app"
      className={[
        'app-download-bar z-30 flex h-[var(--app-download-bar)] w-full shrink-0 items-center border-t border-brass/40 bg-navy px-2 text-parchment sm:px-4 md:sticky md:bottom-0',
        className,
      ].join(' ')}
    >
      <div className="app-promo-banner mx-auto flex w-full min-w-0 max-w-3xl items-center justify-between gap-1.5 sm:gap-2">
        <p className="flex min-w-0 items-center gap-1.5 text-parchment">
          <span
            className="app-promo-live-dot hidden h-1.5 w-1.5 shrink-0 rounded-full bg-brassLight sm:block"
            aria-hidden
          />
          <span className="min-w-0 truncate">
            <span className="font-display text-[11px] leading-none sm:text-[13px]">
              <span className="sm:hidden">Get the app</span>
              <span className="hidden sm:inline">Get the CourtLiveStream app</span>
            </span>
            <span className="hidden font-body text-[10px] text-brassLight md:inline">
              {' '}
              — Track cases & hearing alerts
            </span>
          </span>
        </p>
        <StoreBadgeRow compact />
      </div>
    </aside>
  )
}
