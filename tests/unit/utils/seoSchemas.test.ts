import { describe, it, expect } from 'vitest'
import {
  buildCanonicalUrl,
  buildWebSiteSchema,
  buildItemListSchema,
  buildCollectionPageSchema,
  buildCourseSchema,
  buildLessonSchema,
} from '../../../src/utils/seoSchemas'

describe('seoSchemas', () => {
  const SITE_URL = 'https://saint2706.github.io/Coding-For-MBA'

  describe('buildCanonicalUrl', () => {
    it('should return site URL when no path is provided', () => {
      // Act
      const result = buildCanonicalUrl()

      // Assert
      expect(result).toBe(SITE_URL)
    })

    it('should correctly format path starting with a slash', () => {
      // Act
      const result = buildCanonicalUrl('/lesson/1')

      // Assert
      expect(result).toBe(`${SITE_URL}/#/lesson/1`)
    })

    it('should correctly format path without a starting slash', () => {
      // Act
      const result = buildCanonicalUrl('lesson/1')

      // Assert
      expect(result).toBe(`${SITE_URL}/#/lesson/1`)
    })
  })

  describe('buildWebSiteSchema', () => {
    it('should return valid WebSite schema with correct properties', () => {
      // Act
      const schema = buildWebSiteSchema()

      // Assert
      expect(schema).toMatchObject({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Coding for MBA',
        url: `${SITE_URL}/`,
        description: expect.any(String),
      })

      const potentialAction = schema.potentialAction as Record<string, unknown>
      expect(potentialAction).toBeDefined()
      expect(potentialAction['@type']).toBe('SearchAction')
      expect((potentialAction.target as Record<string, unknown>).urlTemplate).toBe(
        `${SITE_URL}/#/search?q={search_term_string}`,
      )
      expect(potentialAction['query-input']).toBe('required name=search_term_string')
    })
  })

  describe('buildItemListSchema', () => {
    it('should correctly map items and generate URLs', () => {
      // Arrange
      const items = [
        { name: 'Item 1', url: '/item/1', position: 1, description: 'Desc 1' },
        { name: 'External Item', url: 'https://example.com/item', position: 2 },
      ]

      // Act
      const schema = buildItemListSchema('My List', 'A test list', items)

      // Assert
      expect(schema['@context']).toBe('https://schema.org')
      expect(schema['@type']).toBe('ItemList')
      expect(schema.name).toBe('My List')
      expect(schema.description).toBe('A test list')
      expect(schema.url).toBe(`${SITE_URL}/#/curriculum`)
      expect(schema.numberOfItems).toBe(2)

      const elements = schema.itemListElement as Record<string, unknown>[]
      expect(elements).toHaveLength(2)

      expect(elements[0]).toMatchObject({
        '@type': 'ListItem',
        position: 1,
        name: 'Item 1',
        description: 'Desc 1',
        url: `${SITE_URL}/#/item/1`,
      })

      expect(elements[1]).toMatchObject({
        '@type': 'ListItem',
        position: 2,
        name: 'External Item',
        description: undefined,
        url: 'https://example.com/item',
      })
    })
  })

  describe('buildCollectionPageSchema', () => {
    it('should correctly map parts and generate URLs', () => {
      // Arrange
      const parts = [
        { name: 'Part A', url: '/part-a', description: 'Desc A' },
        { name: 'External Part', url: 'http://external.com' },
      ]

      // Act
      const schema = buildCollectionPageSchema('Collection', 'My Collection', '/collection', parts)

      // Assert
      expect(schema['@context']).toBe('https://schema.org')
      expect(schema['@type']).toBe('CollectionPage')
      expect(schema.name).toBe('Collection')
      expect(schema.description).toBe('My Collection')
      expect(schema.url).toBe(`${SITE_URL}/#/collection`)

      const hasPart = schema.hasPart as Record<string, unknown>[]
      expect(hasPart).toHaveLength(2)

      expect(hasPart[0]).toMatchObject({
        '@type': 'CreativeWork',
        name: 'Part A',
        description: 'Desc A',
        url: `${SITE_URL}/#/part-a`,
      })

      expect(hasPart[1]).toMatchObject({
        '@type': 'CreativeWork',
        name: 'External Part',
        description: undefined,
        url: 'http://external.com',
      })
    })
  })

  describe('buildCourseSchema', () => {
    it('should return valid Course schema with core properties', () => {
      // Act
      const schema = buildCourseSchema()

      // Assert
      expect(schema['@context']).toBe('https://schema.org')
      expect(schema['@type']).toBe('Course')
      expect(schema.name).toBe('Coding for MBA — 162-Day Technical Curriculum')
      expect(schema.url).toBe(`${SITE_URL}/`)
      expect(schema.numberOfCredits).toBe(162)

      const provider = schema.provider as Record<string, unknown>
      expect(provider['@type']).toBe('Organization')
      expect(provider.name).toBe('Coding for MBA')

      expect(schema.teaches).toBeInstanceOf(Array)
      expect((schema.teaches as string[]).includes('Python Programming')).toBe(true)

      const instance = schema.hasCourseInstance as Record<string, unknown>
      expect(instance['@type']).toBe('CourseInstance')
      expect(instance.courseMode).toBe('Online')
    })
  })

  describe('buildLessonSchema', () => {
    it('should return valid LearningResource/TechArticle schema', () => {
      // Act
      const schema = buildLessonSchema('Test Lesson', 'Lesson Desc', 'lesson/1', 5, 2)

      // Assert
      expect(schema['@context']).toBe('https://schema.org')
      expect(schema['@type']).toEqual(['LearningResource', 'TechArticle', 'Article'])
      expect(schema.name).toBe('Test Lesson')
      expect(schema.headline).toBe('Test Lesson')
      expect(schema.description).toBe('Lesson Desc')
      expect(schema.url).toBe(`${SITE_URL}/#/lesson/1`)
      expect(schema.position).toBe(5)
      expect(schema.educationalLevel).toBe('Professional')
      expect(schema.learningResourceType).toBe('Lesson')

      const isPartOf = schema.isPartOf as Record<string, unknown>
      expect(isPartOf['@type']).toBe('Course')
      expect(isPartOf.name).toBe('Coding for MBA — 162-Day Technical Curriculum')

      const about = schema.about as Record<string, unknown>
      expect(about['@type']).toBe('Thing')
      expect(about.name).toBe('Phase 2 - Day 5')
    })
  })
})
