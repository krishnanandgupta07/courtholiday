/**
 * Visible breadcrumb navigation + semantic landmark.
 * Mirrors BreadcrumbList JSON-LD from seo/content.ts.
 */
import { Link } from 'react-router-dom'
import type { BreadcrumbItem } from '../../seo/content'

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length === 0) return null

  return (
    <nav
      aria-label="Breadcrumb"
      className="shrink-0 border-b border-brassLight/25 bg-parchmentDim/40"
    >
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 px-3 py-1.5 font-body text-[11px] text-inkSoft sm:px-4 sm:text-xs md:px-6 lg:px-8">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={`${item.path}-${item.name}`} className="flex items-center gap-1.5">
              {index > 0 ? (
                <span className="text-brass/70" aria-hidden>
                  &gt;
                </span>
              ) : null}
              {isLast ? (
                <span className="font-medium text-ink" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="text-navy underline-offset-2 transition hover:text-burgundy hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
                >
                  {item.name}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
