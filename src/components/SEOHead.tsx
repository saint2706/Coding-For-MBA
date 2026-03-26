/**
 * SEO Head Component
 *
 * Manages per-page meta tags for Search Engine Optimization and Social Sharing.
 *
 * Key Responsibilities:
 * - Inject `<title>`, `<meta name="description">`, and canonical links.
 * - Configure Open Graph (Facebook/LinkedIn) and Twitter Card tags.
 * - Inject JSON-LD structured data for rich snippets (Course, Article, Breadcrumbs).
 */

import { Helmet } from '@dr.pogodin/react-helmet'
import { buildCanonicalUrl } from '../utils/seoSchemas'

const SITE_NAME = 'Coding for MBA'
const DEFAULT_IMAGE = 'https://saint2706.github.io/Coding-For-MBA/og-image.png'
const DEFAULT_DESCRIPTION =
  'A structured 140-day curriculum covering Python, Data Science, Machine Learning, Business Intelligence, and Enterprise SQL — designed for MBA professionals.'

interface BreadcrumbItem {
  name: string
  url: string
}

interface SEOHeadProps {
  /** Page title (will be suffixed with " — Coding for MBA" unless it already contains it). */
  title: string
  /** Meta description for the page. */
  description?: string
  /** Canonical path (e.g. "/curriculum"). Defaults to current hash path. */
  path?: string
  /** Open Graph type. Defaults to "website". */
  ogType?: string
  /** Custom OG image URL. */
  image?: string
  /** JSON-LD structured data objects to inject (array of schema objects). */
  jsonLd?: Record<string, unknown>[]
  /** Breadcrumb items for BreadcrumbList schema. */
  breadcrumbs?: BreadcrumbItem[]
  /** Whether to add noindex meta tag. */
  noIndex?: boolean
  /** Article-specific: published date. */
  articlePublished?: string
  /** Article-specific: modified date. */
  articleModified?: string
}

/** Build the BreadcrumbList JSON-LD schema */
function buildBreadcrumbSchema(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : buildCanonicalUrl(item.url),
    })),
  }
}

export default function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  ogType = 'website',
  image = DEFAULT_IMAGE,
  jsonLd = [],
  breadcrumbs,
  noIndex = false,
  articlePublished,
  articleModified,
}: SEOHeadProps) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`
  const canonicalUrl = buildCanonicalUrl(path)

  const allSchemas = [...jsonLd]
  if (breadcrumbs && breadcrumbs.length > 0) {
    allSchemas.push(buildBreadcrumbSchema(breadcrumbs))
  }

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Article-specific meta */}
      {articlePublished && <meta property="article:published_time" content={articlePublished} />}
      {articleModified && <meta property="article:modified_time" content={articleModified} />}

      {/* JSON-LD Structured Data */}
      {allSchemas.map((schema, i) => (
        <script
          key={`jsonld-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ /* nosec */
            __html: JSON.stringify(schema).replace(/</g, '\u003c'),
          }}
        />
      ))}
    </Helmet>
  )
}
