/**
 * Server render helper (optional).
 * Production prerender is performed by scripts/generate-seo.ts, which injects
 * meta / OG / JSON-LD / crawlable body into Vite's dist HTML per SEO URL.
 *
 * Full React SSR with react-router v7 StaticRouterProvider can be wired here
 * later if needed; the generate-seo pipeline already satisfies crawler HTML.
 */
export { seoContentForPath } from './seo/resolvePath'
export { buildPageSchemas } from './seo/schema'
export { buildSeoRouteManifest } from './seo/routes'
