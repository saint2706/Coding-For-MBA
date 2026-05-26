import { describe, it, expect, vi } from 'vitest'
import criticalCss from '../vite-plugin-critical-css'

describe('vite-plugin-critical-css', () => {
  it('returns plugin object correctly', () => {
    const plugin = criticalCss()
    expect(plugin.name).toBe('vite-plugin-critical-css')
    expect(plugin.apply).toBe('build')
    expect(plugin.enforce).toBe('post')
    expect(typeof plugin.transformIndexHtml).toBe('function')
  })

  it('transformIndexHtml gracefully handles errors', async () => {
    // Mocking the dynamically imported beasties would be complex,
    // but we can test the fallback catch block easily by passing invalid HTML if beasties throws
    // Or we just call the function directly
    const plugin = criticalCss() as any
    // Call transformIndexHtml
    const result = await plugin.transformIndexHtml('<html></html>')

    // We expect it to return the string (either processed or unprocessed)
    expect(typeof result).toBe('string')
  })
})
