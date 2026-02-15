## 2025-02-12 - ConceptGraph Filtering Optimization
**Learning:** Nested loops involving D3 selections (`d3.selectAll`) are extremely expensive because they trigger DOM traversals for every iteration. In `ConceptGraph.tsx`, filtering was O(E * N) due to calling a helper function that re-selected all nodes for every edge.
**Action:** Always pre-calculate node states into a `Set` or `Map` (O(N)) before iterating over edges. This allows O(1) lookups inside the edge loop, reducing overall complexity to O(N + E).
