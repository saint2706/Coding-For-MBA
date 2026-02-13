import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Search Performance', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('measures cold start search time', async () => {
    const { search } = await import('./searchIndex');
    const start = performance.now();
    search('python');
    const end = performance.now();
    const duration = end - start;
    console.log(`Cold search duration: ${duration.toFixed(4)}ms`);
  });

  it('measures search time after preload', async () => {
    const { search, preloadSearchIndex } = await import('./searchIndex');

    // Simulate preload (happens during idle time in App)
    const startPreload = performance.now();
    preloadSearchIndex();
    const endPreload = performance.now();
    console.log(`Preload duration: ${(endPreload - startPreload).toFixed(4)}ms`);

    // Measure "first" search from user perspective
    const startSearch = performance.now();
    const results = search('python');
    const endSearch = performance.now();
    const duration = endSearch - startSearch;

    console.log(`Search duration after preload: ${duration.toFixed(4)}ms`);

    // Verify functionality
    expect(results.length).toBeGreaterThan(0);

    // Soft assertion for performance to avoid flaky CI failures
    if (duration > 200) {
      console.warn(`Performance warning: Search took ${duration.toFixed(4)}ms (expected < 200ms)`);
    }
  });
});
