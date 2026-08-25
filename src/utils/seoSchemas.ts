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

import { getCurriculumMetadata } from './contentLoader'

const SITE_URL = 'https://saint2706.github.io/Coding-For-MBA'
const SITE_NAME = 'Coding for MBA'

/**
 * Total curriculum days, read lazily (not at module load) so importing
 * this module never requires curriculum content to be available.
 */
function getCurriculumTotalDays(): number {
  return getCurriculumMetadata().totalDays
}

function getDefaultDescription(): string {
  return `A structured ${getCurriculumTotalDays()}-day curriculum covering Python, Data Science, Machine Learning, Business Intelligence, and Enterprise SQL — designed for MBA professionals.`
}

/**
 * Build a full canonical URL from a hash path.
 *
 * @param {string} [path] - The optional hash path.
 * @returns {string} The full canonical URL.
 */
export function buildCanonicalUrl(path?: string): string {
  if (!path) return SITE_URL
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}/#${cleanPath}`
}

/**
 * Build the WebSite JSON-LD schema (typically for the home page).
 *
 * @returns {Record<string, unknown>} The WebSite JSON-LD schema.
 */
export function buildWebSiteSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    description: getDefaultDescription(),
    image: `${SITE_URL}/og-image.png`,
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

/**
 * Build an ItemList schema to describe a list of phases or lessons.
 * Useful for the Curriculum Overview page.
 *
 * @param {string} name - The name of the item list.
 * @param {string} description - The description of the item list.
 * @param {Array<{ name: string; url: string; position: number; description?: string }>} items - The list of items to include.
 * @returns {Record<string, unknown>} The ItemList JSON-LD schema.
 */
export function buildItemListSchema(
  name: string,
  description: string,
  items: { name: string; url: string; position: number; description?: string }[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    description,
    url: `${SITE_URL}/#/curriculum`,
    numberOfItems: items.length,
    itemListElement: items.map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      description: item.description,
      url: item.url.startsWith('http') ? item.url : buildCanonicalUrl(item.url),
    })),
  }
}

/**
 * Build a CollectionPage schema for the Exercises page.
 *
 * @param {string} name - The name of the collection page.
 * @param {string} description - The description of the collection page.
 * @param {string} path - The relative path of the collection page.
 * @param {Array<{ name: string; url: string; description?: string }>} hasPart - The parts belonging to the collection.
 * @returns {Record<string, unknown>} The CollectionPage JSON-LD schema.
 */
export function buildCollectionPageSchema(
  name: string,
  description: string,
  path: string,
  hasPart: { name: string; url: string; description?: string }[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url: buildCanonicalUrl(path),
    hasPart: hasPart.map((part) => ({
      '@type': 'CreativeWork',
      name: part.name,
      description: part.description,
      url: part.url.startsWith('http') ? part.url : buildCanonicalUrl(part.url),
    })),
  }
}

/**
 * Build a Course JSON-LD schema for the curriculum.
 *
 * @returns {Record<string, unknown>} The Course JSON-LD schema.
 */
export function buildCourseSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: `Coding for MBA — ${getCurriculumTotalDays()}-Day Technical Curriculum`,
    description: getDefaultDescription(),
    url: `${SITE_URL}/`,
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: `${SITE_URL}/`,
    },
    numberOfCredits: getCurriculumTotalDays(),
    educationalLevel: 'Professional',
    teaches: [
      'Python Programming',
      'Data Science',
      'Machine Learning',
      'Business Intelligence',
      'SQL',
      'Data Engineering',
    ],
    timeRequired: `P${getCurriculumTotalDays()}D`,
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'Online',
      courseWorkload: 'PT100H',
    },
  }
}

/**
 * Build an FAQPage JSON-LD schema for Q&A sections (like Mastery Checks).
 *
 * @param {Array<{ question: string; answer: string }>} questions - An array of question and answer pairs.
 * @returns {Record<string, unknown>} The FAQPage JSON-LD schema.
 */
export function buildFAQSchema(
  questions: { question: string; answer: string }[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  }
}

/**
 * Build a Product JSON-LD schema.
 *
 * @param {string} name - The name of the product.
 * @param {string} description - The description of the product.
 * @param {string} [image] - An optional image URL for the product.
 * @returns {Record<string, unknown>} The Product JSON-LD schema.
 */
export function buildProductSchema(
  name: string,
  description: string,
  image?: string,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: image || `${SITE_URL}/og-image.png`,
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  }
}

/**
 * Build an Article/LearningResource JSON-LD schema for a lesson page.
 *
 * @param {string} title - The title of the lesson.
 * @param {string} description - The description of the lesson.
 * @param {string} path - The relative path of the lesson page.
 * @param {number} day - The day number of the lesson.
 * @param {number} phase - The phase number of the lesson.
 * @returns {Record<string, unknown>} The Article/LearningResource JSON-LD schema.
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
    '@type': ['LearningResource', 'TechArticle', 'Article'],
    name: title,
    headline: title,
    description,
    url: buildCanonicalUrl(path),
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: `${SITE_URL}/`,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: `${SITE_URL}/`,
    },
    image: `${SITE_URL}/og-image.png`,
    isPartOf: {
      '@type': 'Course',
      name: `Coding for MBA — ${getCurriculumTotalDays()}-Day Technical Curriculum`,
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
