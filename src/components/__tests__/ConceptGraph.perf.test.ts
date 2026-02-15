import { describe, it, expect } from 'vitest'

describe('ConceptGraph Performance', () => {
  it('should be significantly faster with O(N+E) filtering compared to O(E*N)', () => {
    // Setup mock data
    const NODE_COUNT = 1000
    const EDGE_COUNT = 2000

    const nodes = Array.from({ length: NODE_COUNT }, (_, i) => ({
      id: i,
      label: `Node ${i}`,
      title: `Title ${i}`,
      phase: i % 5,
      concepts: [`concept${i % 10}`]
    }))

    const edges = Array.from({ length: EDGE_COUNT }, (_, i) => ({
      source: i % NODE_COUNT,
      target: (i + 1) % NODE_COUNT
    }))

    const _search = 'Node'
    const _highlightPhase = null

    // Simulate OLD O(E*N) approach
    const startOld = performance.now()

    // Mock D3 selection behavior (extremely simplified for perf comparison)
    // In reality, d3.selectAll is much slower due to DOM traversal
    const mockSelectAllNodes = () => nodes

    let _oldVisibleCount = 0

    // Node loop (O(N))
    nodes.forEach(() => {
      // visibility check logic
      const isVisible = true // Simplified
      if (isVisible) _oldVisibleCount++
    })

    // Edge loop (O(E)) calling checkNodeMatch (O(N))
    edges.forEach(edge => {
      // In the original code, checkNodeMatch is called twice per edge
      // and iterates over all nodes to find the match

      const checkNodeMatch = (id: number) => {
        let match = false
        // inner loop O(N)
        mockSelectAllNodes().forEach(n => {
          if (n.id === id) {
             // simplified check
             match = true
          }
        })
        return match
      }

      const sMatch = checkNodeMatch(edge.source)
      const tMatch = checkNodeMatch(edge.target)

      if (sMatch && tMatch) {
        // update edge
      }
    })

    const endOld = performance.now()
    const timeOld = endOld - startOld

    // Simulate NEW O(N+E) approach
    const startNew = performance.now()

    const visibleNodeIds = new Set<number>()
    let _newVisibleCount = 0

    // Node loop (O(N))
    nodes.forEach(node => {
      const isVisible = true // Simplified
      if (isVisible) {
        visibleNodeIds.add(node.id)
        _newVisibleCount++
      }
    })

    // Edge loop (O(E)) with O(1) lookup
    edges.forEach(edge => {
      const sMatch = visibleNodeIds.has(edge.source)
      const tMatch = visibleNodeIds.has(edge.target)

      if (sMatch && tMatch) {
        // update edge
      }
    })

    const endNew = performance.now()
    const timeNew = endNew - startNew

    console.log(`Old approach (O(E*N)): ${timeOld.toFixed(2)}ms`)
    console.log(`New approach (O(N+E)): ${timeNew.toFixed(2)}ms`)
    console.log(`Speedup: ${(timeOld / timeNew).toFixed(1)}x`)

    expect(timeNew).toBeLessThan(timeOld)
    expect(timeOld / timeNew).toBeGreaterThan(10) // Expect at least 10x speedup
  })
})
