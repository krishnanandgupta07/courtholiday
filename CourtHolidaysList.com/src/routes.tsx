/**
 * Application route tree — SEO-friendly paths (no query strings).
 * Used by BrowserRouter (client) and StaticRouter (prerender).
 */
import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'

const CourtHolidayPage = lazy(() =>
  import('./pages/CourtHolidayPage').then((m) => ({
    default: m.CourtHolidayPage,
  })),
)
const CategoryListingPage = lazy(() =>
  import('./pages/CategoryListingPage').then((m) => ({
    default: m.CategoryListingPage,
  })),
)
const SupremeCourtHubPage = lazy(() =>
  import('./pages/SupremeCourtHubPage').then((m) => ({
    default: m.SupremeCourtHubPage,
  })),
)
const StatePage = lazy(() =>
  import('./pages/StatePage').then((m) => ({ default: m.StatePage })),
)
const YearHubPage = lazy(() =>
  import('./pages/YearHubPage').then((m) => ({ default: m.YearHubPage })),
)
const ContactPage = lazy(() =>
  import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })),
)
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
)

function RouteFallback() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-parchment font-body text-sm text-inkSoft"
      aria-busy="true"
      aria-label="Loading page"
    >
      Loading…
    </div>
  )
}

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/supreme-court" element={<SupremeCourtHubPage />} />
        <Route
          path="/high-courts"
          element={<CategoryListingPage categorySegment="high-courts" />}
        />
        <Route
          path="/high-courts/page/:page"
          element={<CategoryListingPage categorySegment="high-courts" />}
        />
        <Route
          path="/district-courts"
          element={<CategoryListingPage categorySegment="district-courts" />}
        />
        <Route
          path="/district-courts/page/:page"
          element={<CategoryListingPage categorySegment="district-courts" />}
        />
        <Route
          path="/tribunals"
          element={<CategoryListingPage categorySegment="tribunals" />}
        />
        <Route
          path="/tribunals/page/:page"
          element={<CategoryListingPage categorySegment="tribunals" />}
        />
        <Route path="/states/:stateSlug" element={<StatePage />} />
        {/* Sitemap shape: /states/delhi/holidays-2026 */}
        <Route
          path="/states/:stateSlug/:yearSegment"
          element={<StatePage />}
        />
        <Route path="/years/:year" element={<YearHubPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        {/* Court holiday slug pages: /delhi-high-court-holidays-2026 */}
        <Route path="/:courtHolidaySlug" element={<CourtHolidayPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
