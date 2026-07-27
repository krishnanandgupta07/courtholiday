/**
 * Post-build SEO generator.
 * 1) Fetches courts + years from the live API
 * 2) Writes dynamic sitemap.xml + robots.txt
 * 3) Prerenders each SEO URL into dist/.../index.html with meta, OG, JSON-LD, and crawlable body
 *
 * Run: tsx scripts/generate-seo.ts (after vite build)
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildSeoRouteManifest } from '../src/seo/routes'
import { buildPageSchemas } from '../src/seo/schema'
import { SITE_URL } from '../src/seo/constants'
import { absoluteUrl } from '../src/seo/slugs'
import { seoContentForPath } from '../src/seo/resolvePath'
import type { CourtOption } from '../src/types/api'
import { DEFAULT_OG_IMAGE } from '../src/seo/constants'
import { filterSelectableYears } from '../src/utils/yearAvailability'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const distDir = path.join(root, 'dist')

const API_BASE = (
  process.env.VITE_API_BASE_URL || 'https://api.courtlivestream.com'
).replace(/\/$/, '')

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url} → ${res.status}`)
  return res.json() as Promise<T>
}

async function loadCourtsAndYears(): Promise<{
  courts: CourtOption[]
  years: number[]
}> {
  const [courtsPayload, yearsPayload] = await Promise.all([
    fetchJson<{ success: boolean; data: { courtName: string }[] }>(
      `${API_BASE}/api/app/courts/list`,
    ),
    fetchJson<{ success: boolean; data: number[] }>(
      `${API_BASE}/api/app/holidays/years`,
    ).catch(() => ({ success: true, data: [new Date().getFullYear()] })),
  ])

  const courts: CourtOption[] = (courtsPayload.data ?? []).map((c) => ({
    courtName: c.courtName,
  }))
  courts.sort((a, b) => a.courtName.localeCompare(b.courtName))

  const years = filterSelectableYears(
    (yearsPayload.data ?? [new Date().getFullYear()])
      .map(Number)
      .filter(Number.isFinite),
  )

  return { courts, years: years.length ? years : [new Date().getFullYear()] }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildHeadTags(
  seo: ReturnType<typeof seoContentForPath>,
  noindex = false,
): string {
  const canonical = absoluteUrl(seo.canonicalPath)
  const robots = noindex ? 'noindex, follow' : 'index, follow'
  const schemas = buildPageSchemas({
    title: seo.title,
    description: seo.description,
    path: seo.canonicalPath,
    breadcrumbs: seo.breadcrumbs,
    faqs: seo.faqs,
  })

  const schemaScripts = schemas
    .map(
      (s: Record<string, unknown>) =>
        `<script type="application/ld+json">${JSON.stringify(s)}</script>`,
    )
    .join('\n')

  return `
    <title>${escapeHtml(seo.title)}</title>
    <meta name="description" content="${escapeHtml(seo.description)}" />
    <meta name="keywords" content="${escapeHtml(seo.keywords)}" />
    <meta name="robots" content="${robots}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="CourtHoliday" />
    <meta property="og:locale" content="en_IN" />
    <meta property="og:title" content="${escapeHtml(seo.title)}" />
    <meta property="og:description" content="${escapeHtml(seo.description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${DEFAULT_OG_IMAGE}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(seo.title)}" />
    <meta name="twitter:description" content="${escapeHtml(seo.description)}" />
    <meta name="twitter:image" content="${DEFAULT_OG_IMAGE}" />
    ${schemaScripts}
  `
}

function buildPrerenderBody(seo: ReturnType<typeof seoContentForPath>): string {
  const crumbs = seo.breadcrumbs
    .map((b: { name: string; path: string }, i: number) => {
      const sep = i > 0 ? ' <span aria-hidden="true">&gt;</span> ' : ''
      return `${sep}<a href="${absoluteUrl(b.path)}">${escapeHtml(b.name)}</a>`
    })
    .join('')

  const faqs = seo.faqs
    .map(
      (f: { question: string; answer: string }) => `
      <details>
        <summary>${escapeHtml(f.question)}</summary>
        <p>${escapeHtml(f.answer)}</p>
      </details>`,
    )
    .join('')

  return `
    <div id="seo-prerender">
      <nav aria-label="Breadcrumb"><p>${crumbs}</p></nav>
      <main>
        <h1>${escapeHtml(seo.h1)}</h1>
        <p>${escapeHtml(seo.description)}</p>
        ${faqs ? `<section aria-labelledby="faq-heading"><h2 id="faq-heading">Frequently Asked Questions</h2>${faqs}</section>` : ''}
      </main>
    </div>
  `
}

function injectHtml(template: string, head: string, body: string): string {
  let html = template

  // Remove default title/description so prerendered tags win
  html = html.replace(/<title>[^<]*<\/title>/i, '')
  html = html.replace(
    /<meta\s+name=["']description["'][^>]*>/i,
    '',
  )

  if (html.includes('</head>')) {
    html = html.replace('</head>', `${head}\n</head>`)
  }

  if (html.includes('<div id="root"></div>')) {
    html = html.replace(
      '<div id="root"></div>',
      `<div id="root">${body}</div>`,
    )
  } else if (html.includes('<div id="root">')) {
    html = html.replace(
      /<div id="root">[\s\S]*?<\/div>/,
      `<div id="root">${body}</div>`,
    )
  }

  return html
}

function pathToFile(routePath: string): string {
  if (routePath === '/' || routePath === '') {
    return path.join(distDir, 'index.html')
  }
  const clean = routePath.replace(/^\//, '').replace(/\/$/, '')
  return path.join(distDir, clean, 'index.html')
}

function buildSitemapXml(
  entries: { path: string; priority: number; changefreq: string }[],
): string {
  const lastmod = new Date().toISOString().slice(0, 10)
  const urls = entries
    .map((e) => {
      const loc = absoluteUrl(e.path === '/' ? '/' : e.path)
      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority.toFixed(1)}</priority>
  </url>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}

async function main() {
  console.log(`[seo] API base: ${API_BASE}`)
  console.log(`[seo] Site URL: ${SITE_URL}`)

  const templatePath = path.join(distDir, 'index.html')
  let template: string
  try {
    template = await readFile(templatePath, 'utf8')
  } catch {
    throw new Error(
      `Missing ${templatePath}. Run "vite build" before generate-seo.`,
    )
  }

  const { courts, years } = await loadCourtsAndYears()
  console.log(`[seo] Courts: ${courts.length}, years: ${years.join(', ')}`)

  const manifest = buildSeoRouteManifest(courts, years)
  console.log(`[seo] Routes to prerender: ${manifest.length}`)

  await writeFile(
    path.join(distDir, 'sitemap.xml'),
    buildSitemapXml(manifest),
    'utf8',
  )
  await writeFile(
    path.join(distDir, 'robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
    'utf8',
  )
  console.log('[seo] Wrote sitemap.xml and robots.txt')

  let written = 0
  for (const entry of manifest) {
    const seo = seoContentForPath(entry.path, courts, years)
    const noindex = entry.path === '/404'
    const head = buildHeadTags(seo, noindex)
    const body = buildPrerenderBody(seo)
    const html = injectHtml(template, head, body)
    const outFile = pathToFile(entry.path)
    await mkdir(path.dirname(outFile), { recursive: true })
    await writeFile(outFile, html, 'utf8')
    written++
    if (written % 50 === 0) {
      console.log(`[seo] Prerendered ${written}/${manifest.length}…`)
    }
  }

  // Dedicated 404.html for Nginx error_page
  const notFoundSeo = seoContentForPath('/404', courts, years)
  const notFoundHtml = injectHtml(
    template,
    buildHeadTags(notFoundSeo, true),
    buildPrerenderBody(notFoundSeo),
  )
  await writeFile(path.join(distDir, '404.html'), notFoundHtml, 'utf8')

  console.log(`[seo] Done. Prerendered ${written} pages + 404.html`)
}

main().catch((err) => {
  console.error('[seo] Failed:', err)
  process.exit(1)
})
