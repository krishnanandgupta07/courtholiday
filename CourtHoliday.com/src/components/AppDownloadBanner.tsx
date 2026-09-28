/**
 * Slim navy app download strip — sits in the page above the footer
 * and sticks to the bottom of the screen until the footer arrives.
 */
import { StoreBadgePair } from './AppStoreLinks'

export function AppDownloadBanner() {
  return (
    <aside
      aria-label="Download CourtLiveStream app"
      className="border-t border-brass/40 bg-navy px-2 py-1 sm:px-4 md:sticky md:bottom-0 md:z-30 md:shrink-0"
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
        <div className="shrink-0">
          <StoreBadgePair compact />
        </div>
      </div>
    </aside>
  )
}
