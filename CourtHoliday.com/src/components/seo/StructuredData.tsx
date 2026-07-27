/**
 * Injects JSON-LD structured data scripts into the document head.
 * Schemas are built by src/seo/schema.ts from page content.
 */
import { Helmet } from 'react-helmet-async'

interface StructuredDataProps {
  schemas: Record<string, unknown>[]
}

export function StructuredData({ schemas }: StructuredDataProps) {
  if (schemas.length === 0) return null

  return (
    <Helmet>
      {schemas.map((schema, index) => (
        <script
          key={`ld-json-${index}`}
          type="application/ld+json"
          // Helmet requires innerHTML for JSON-LD script bodies
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </Helmet>
  )
}
