/**
 * Slim full-width download strip.
 * Last child of the page content wrapper (Footer is a sibling after that wrapper)
 * so `md:sticky; bottom: 0` stays on screen while scrolling and releases above the footer.
 * Mobile keeps it in normal flow so it never covers the calendar.
 * Motion matches courtholiday.com.
 */
import { StoreBadgePair } from './StoreBadges'

export function AppDownloadBanner() {
  return (
    <aside
      aria-label="Download CourtLiveStream app"
      className="z-30 mt-auto shrink-0 border-t border-brass/40 bg-navy px-2 py-1 text-parchment sm:px-4 md:sticky md:bottom-0 md:z-30"
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
        <StoreBadgePair compact />
      </div>
    </aside>
  )
}
