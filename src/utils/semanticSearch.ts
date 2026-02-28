/**
 * Semantic Search Utility
 *
 * Uses Gemini text embeddings + cosine similarity for semantic search
 * across all lessons. Falls back to Fuse.js if the API is unavailable.
 *
 * @module utils/semanticSearch
 */

import { getAllLessons, type Lesson } from './contentLoader'
import { embedText, isGeminiAvailable } from './geminiClient'

interface EmbeddingCache {
    version: number
    embeddings: Record<string, number[]>
}

const CACHE_KEY = 'semantic-embeddings-v1'
const CACHE_VERSION = 1

export interface SemanticResult {
    lesson: Lesson
    score: number
}

function loadCache(): EmbeddingCache {
    try {
        const raw = localStorage.getItem(CACHE_KEY)
        if (!raw) return { version: CACHE_VERSION, embeddings: {} }
        const parsed = JSON.parse(raw) as EmbeddingCache
        if (parsed.version !== CACHE_VERSION) return { version: CACHE_VERSION, embeddings: {} }
        return parsed
    } catch {
        return { version: CACHE_VERSION, embeddings: {} }
    }
}

function saveCache(cache: EmbeddingCache): void {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
    } catch {
        // Silently fail if storage is full
    }
}

function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length || a.length === 0) return 0
    let dot = 0
    let normA = 0
    let normB = 0
    for (let i = 0; i < a.length; i++) {
        dot += a[i]! * b[i]!
        normA += a[i]! * a[i]!
        normB += b[i]! * b[i]!
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB)
    return denom === 0 ? 0 : dot / denom
}

function stripMarkdownForEmbed(md: string): string {
    return md
        .replace(/```[\s\S]*?```|`[^`]*`|!\[[^\]]*\]\([^)]+\)/g, ' ')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/(^\s*\d+\.\s+|^\s*[-*+]\s+|[#_~>|]+)/gm, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 500)
}

async function getOrComputeEmbedding(
    key: string,
    text: string,
    cache: EmbeddingCache,
): Promise<number[]> {
    if (cache.embeddings[key]) {
        return cache.embeddings[key]
    }
    const embedding = await embedText(text)
    cache.embeddings[key] = embedding
    return embedding
}

export async function semanticSearch(query: string, limit = 15): Promise<SemanticResult[]> {
    if (!isGeminiAvailable()) {
        throw new Error('Gemini API not available')
    }

    const cache = loadCache()
    const lessons = getAllLessons()

    const queryEmbedding = await embedText(query)

    const lessonTexts = lessons.map((l) => ({
        key: String(l.day),
        text: `${l.title}. ${stripMarkdownForEmbed(l.content)}`,
        lesson: l,
    }))

    const CONCURRENCY = 3
    for (let i = 0; i < lessonTexts.length; i += CONCURRENCY) {
        const batch = lessonTexts.slice(i, i + CONCURRENCY)
        await Promise.all(
            batch
                .filter((item) => !cache.embeddings[item.key])
                .map((item) => getOrComputeEmbedding(item.key, item.text, cache)),
        )
        if (i % (CONCURRENCY * 5) === 0) {
            saveCache(cache)
        }
    }
    saveCache(cache)

    const results: SemanticResult[] = lessonTexts
        .map((item) => {
            const embedding = cache.embeddings[item.key]
            const score = embedding ? cosineSimilarity(queryEmbedding, embedding) : 0
            return { lesson: item.lesson, score }
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)

    return results
}

export function clearEmbeddingCache(): void {
    localStorage.removeItem(CACHE_KEY)
}

export function getEmbeddingCacheSize(): number {
    const cache = loadCache()
    return Object.keys(cache.embeddings).length
}
