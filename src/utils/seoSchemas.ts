/**
 * SEO Schema Generators (JSON-LD)
 *
 * Constructs structured data objects (Schema.org) for search engine optimization.
 * Helps search engines understand the course structure, lessons, and hierarchy.
 *
 * Key Responsibilities:
 * - Generate WebSite, Course, and LearningResource schemas.
 * - Format canonical URLs.
 * - Ensure valid JSON-LD structure.
 */

const SITE_URL = 'https://saint2706.github.io/Coding-For-MBA'
const SITE_NAME = 'Coding for MBA'
const DEFAULT_DESCRIPTION =
  'A structured 108-day curriculum covering Python, Data Science, Machine Learning, Business Intelligence, and Enterprise SQL — designed for MBA professionals.'

/** Build a full canonical URL from a hash path */
export function buildCanonicalUrl(path?: string): string {
  if (!path) return SITE_URL
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}/#${cleanPath}`
}

/** Build the WebSite JSON-LD schema (typically for the home page) */
export function buildWebSiteSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    description: DEFAULT_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/#/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/** Build a Course JSON-LD schema for the curriculum */
export function buildCourseSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'Coding for MBA — 108-Day Technical Curriculum',
    description: DEFAULT_DESCRIPTION,
    url: `${SITE_URL}/`,
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: `${SITE_URL}/`,
    },
    numberOfCredits: 108,
    educationalLevel: 'Professional',
    teaches: [
      'Python Programming',
      'Data Science',
      'Machine Learning',
      'Business Intelligence',
      'SQL',
      'Data Engineering',
    ],
    timeRequired: 'P108D',
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'Online',
      courseWorkload: 'PT100H',
    },
  }
}

/**
 * Build an Article/LearningResource JSON-LD schema for a lesson page.
 */
export function buildLessonSchema(
  title: string,
  description: string,
  path: string,
  day: number,
  phase: number,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: title,
    description,
    url: buildCanonicalUrl(path),
    isPartOf: {
      '@type': 'Course',
      name: 'Coding for MBA — 108-Day Technical Curriculum',
      url: `${SITE_URL}/`,
    },
    position: day,
    educationalLevel: 'Professional',
    learningResourceType: 'Lesson',
    interactivityType: 'mixed',
    about: {
      '@type': 'Thing',
      name: `Phase ${phase} - Day ${day}`,
    },
  }
}
