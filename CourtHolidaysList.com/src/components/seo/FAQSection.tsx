/**
 * Auto-generated FAQ section with accessible accordion.
 * Content drives FAQPage JSON-LD via seo/schema.ts.
 */
import type { FaqItem } from '../../seo/content'

interface FAQSectionProps {
  faqs: FaqItem[]
  heading?: string
}

export function FAQSection({
  faqs,
  heading = 'Frequently Asked Questions',
}: FAQSectionProps) {
  if (faqs.length === 0) return null

  return (
    <section
      aria-labelledby="faq-heading"
      className="w-full border-t border-brassLight/30 bg-parchment px-3 py-4 sm:px-4 md:px-6 lg:px-8"
    >
      <h2
        id="faq-heading"
        className="font-display text-base text-navy sm:text-lg"
      >
        {heading}
      </h2>
      <div className="mt-3 space-y-2">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className="group rounded-sm border border-brassLight/40 bg-parchmentDim/40 open:bg-parchmentDim/70"
          >
            <summary className="cursor-pointer list-none px-3 py-2.5 font-body text-sm font-semibold text-ink marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass [&::-webkit-details-marker]:hidden">
              <span className="flex items-start justify-between gap-3">
                <span>{faq.question}</span>
                <span
                  className="mt-0.5 shrink-0 font-mono text-brass transition group-open:rotate-45"
                  aria-hidden
                >
                  +
                </span>
              </span>
            </summary>
            <p className="border-t border-brassLight/25 px-3 py-2.5 font-body text-sm leading-relaxed text-inkSoft">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  )
}
