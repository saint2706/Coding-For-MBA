import { useRef, useEffect, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as d3 from 'd3'
import { getAllLessons, phaseIcons } from '../utils/contentLoader'

/* ---------- phase colours ---------- */
const PHASE_COLORS = [
  '#818cf8', // Phase 1 – soft indigo
  '#a78bfa', // Phase 2 – soft violet
  '#22d3ee', // Phase 3 – cyan
  '#fbbf24', // Phase 4 – amber
  '#f87171', // Phase 5 – soft red
  '#34d399', // Phase 6 – emerald
  '#60a5fa', // Phase 7 – blue
  '#f472b6', // Phase 8 – pink
  '#fb923c', // Phase 9 – orange
]

/* ---------- types ---------- */
interface GraphNode extends d3.SimulationNodeDatum {
  id: number
  label: string
  title: string
  phase: number
  concepts: string[]
}

interface GraphEdge extends d3.SimulationLinkDatum<GraphNode> {
  source: GraphNode | number
  target: GraphNode | number
}

/* ---------- component ---------- */
interface ConceptGraphProps {
  search?: string
  highlightPhase?: number | null
}

export default function ConceptGraph({ search = '', highlightPhase = null }: ConceptGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphEdge> | null>(null)
  const navigate = useNavigate()
  const [tooltip, setTooltip] = useState<{
    x: number
    y: number
    node: GraphNode
  } | null>(null)

  // Build graph once on mount
  useEffect(() => {
    const container = containerRef.current
    const svg = svgRef.current
    if (!container || !svg) return

    const width = container.clientWidth
    const height = container.clientHeight || 600

    const lessons = getAllLessons()

    // Build nodes & edges
    const nodes: GraphNode[] = lessons.map((l) => ({
      id: l.day,
      label: `D${l.day}`,
      title: l.title,
      phase: l.phase,
      concepts: (l.concepts as string[]) || [],
    }))

    const nodeById = new Map(nodes.map((n) => [n.id, n]))

    const edges: GraphEdge[] = []
    const edgeSet = new Set<string>()
    for (const l of lessons) {
      const prereqs = (l.prerequisites as number[]) || []
      for (const p of prereqs) {
        const key = `${p}-${l.day}`
        if (!edgeSet.has(key) && nodeById.has(p)) {
          edgeSet.add(key)
          edges.push({ source: p, target: l.day })
        }
      }
    }

    // Phase cluster centres (arranged radially)
    const phases = [...new Set(nodes.map((n) => n.phase))].sort((a, b) => a - b)
    const clusterCenters = new Map<number, { x: number; y: number }>()
    phases.forEach((phase, i) => {
      const angle = (2 * Math.PI * i) / phases.length - Math.PI / 2
      const radius = Math.min(width, height) * 0.3
      clusterCenters.set(phase, {
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius,
      })
    })

    // D3 setup
    const d3Svg = d3.select(svg).attr('width', width).attr('height', height)

    d3Svg.selectAll('*').remove()

    // Defs for arrow marker
    d3Svg
      .append('defs')
      .append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 0 8 6')
      .attr('refX', 20)
      .attr('refY', 3)
      .attr('markerWidth', 6)
      .attr('markerHeight', 4)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,0 L8,3 L0,6 Z')
      .attr('fill', 'rgba(148,163,184,0.2)')

    // Zoomable container group
    const g = d3Svg.append('g')

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })
    d3Svg.call(zoom)

    // Initial zoom to fit
    const initialScale = 0.85
    const tx = (width * (1 - initialScale)) / 2
    const ty = (height * (1 - initialScale)) / 2
    d3Svg.call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(initialScale))

    // Edges
    const linkG = g.append('g').attr('class', 'graph-edges')
    const linkElements = linkG
      .selectAll('line')
      .data(edges)
      .join('line')
      .attr('class', 'graph-edge')
      .attr('stroke', 'rgba(148,163,184,0.12)')
      .attr('stroke-width', 1)
      .attr('marker-end', 'url(#arrow)')

    // Node groups
    const nodeG = g.append('g').attr('class', 'graph-nodes')
    const nodeElements = nodeG
      .selectAll<SVGGElement, GraphNode>('g')
      .data(nodes, (d) => d.id)
      .join('g')
      .attr('class', 'graph-node')
      .attr('cursor', 'pointer')

    // Circle for each node
    nodeElements
      .append('circle')
      .attr('r', 12)
      .attr('fill', (d) => PHASE_COLORS[(d.phase - 1) % PHASE_COLORS.length]!)
      .attr('stroke', 'rgba(0,0,0,0.3)')
      .attr('stroke-width', 1)
      .attr('opacity', 0.9)

    // Label
    nodeElements
      .append('text')
      .text((d) => d.label)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', '#fff')
      .attr('font-size', '8px')
      .attr('font-weight', '600')
      .attr('pointer-events', 'none')

    // Drag behaviour
    const drag = d3
      .drag<SVGGElement, GraphNode>()
      .on('start', (event, d) => {
        if (!event.active) simulationRef.current?.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      })
      .on('drag', (event, d) => {
        d.fx = event.x
        d.fy = event.y
      })
      .on('end', (event, d) => {
        if (!event.active) simulationRef.current?.alphaTarget(0)
        d.fx = null
        d.fy = null
      })

    nodeElements.call(drag)

    // Force simulation
    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphEdge>(edges)
          .id((d) => d.id)
          .distance(60)
          .strength(0.3),
      )
      .force('charge', d3.forceManyBody<GraphNode>().strength(-120).distanceMax(300))
      .force('collision', d3.forceCollide<GraphNode>().radius(18).strength(0.8))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.05))
      // Cluster force — pull nodes toward their phase centre
      .force(
        'cluster',
        d3.forceX<GraphNode>((d) => clusterCenters.get(d.phase)?.x ?? width / 2).strength(0.15),
      )
      .force(
        'clusterY',
        d3.forceY<GraphNode>((d) => clusterCenters.get(d.phase)?.y ?? height / 2).strength(0.15),
      )
      .alphaDecay(0.02)
      .velocityDecay(0.4)

    simulation.on('tick', () => {
      linkElements
        .attr('x1', (d) => (d.source as GraphNode).x ?? 0)
        .attr('y1', (d) => (d.source as GraphNode).y ?? 0)
        .attr('x2', (d) => (d.target as GraphNode).x ?? 0)
        .attr('y2', (d) => (d.target as GraphNode).y ?? 0)

      nodeElements.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`)
    })

    simulationRef.current = simulation

    return () => {
      simulation.stop()
    }
  }, [])

  // Handle search/phase filtering via D3 selection opacity
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const d3Svg = d3.select(svg)

    const searchLower = search.toLowerCase()
    const hasFilter = search.length > 0 || highlightPhase !== null

    d3Svg.selectAll<SVGGElement, GraphNode>('.graph-node').each(function (d) {
      const g = d3.select(this)
      if (!hasFilter) {
        g.attr('opacity', 0.9)
        return
      }
      const matchSearch =
        !search ||
        d.label.toLowerCase().includes(searchLower) ||
        d.title.toLowerCase().includes(searchLower) ||
        d.concepts.some((c) => c.toLowerCase().includes(searchLower))
      const matchPhase = highlightPhase === null || d.phase === highlightPhase

      g.attr('opacity', matchSearch && matchPhase ? 1 : 0.08)
    })

    d3Svg.selectAll<SVGLineElement, GraphEdge>('.graph-edge').each(function (d) {
      const line = d3.select(this)
      if (!hasFilter) {
        line.attr('stroke', 'rgba(148,163,184,0.12)')
        return
      }
      const sId = typeof d.source === 'number' ? d.source : (d.source as GraphNode).id
      const tId = typeof d.target === 'number' ? d.target : (d.target as GraphNode).id

      const sMatch = checkNodeMatch(sId)
      const tMatch = checkNodeMatch(tId)

      line.attr('stroke', sMatch && tMatch ? 'rgba(148,163,184,0.3)' : 'rgba(148,163,184,0.03)')
    })

    function checkNodeMatch(nodeId: number): boolean {
      const svg = svgRef.current
      if (!svg) return false
      let match = false
      d3.select(svg)
        .selectAll<SVGGElement, GraphNode>('.graph-node')
        .each(function (d) {
          if (d.id === nodeId) {
            const matchSearch =
              !search ||
              d.label.toLowerCase().includes(searchLower) ||
              d.title.toLowerCase().includes(searchLower) ||
              d.concepts.some((c) => c.toLowerCase().includes(searchLower))
            const matchPhase = highlightPhase === null || d.phase === highlightPhase
            if (matchSearch && matchPhase) match = true
          }
        })
      return match
    }
  }, [search, highlightPhase])

  // Mouse events for tooltip (delegated via SVG)
  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const target = e.target as SVGElement
    const nodeGroup = target.closest('.graph-node') as SVGGElement | null
    if (!nodeGroup || !containerRef.current) {
      setTooltip(null)
      return
    }
    const nodeData = d3.select<SVGGElement, GraphNode>(nodeGroup).datum()
    if (!nodeData) return
    const rect = containerRef.current.getBoundingClientRect()
    setTooltip({
      x: e.clientX - rect.left + 14,
      y: e.clientY - rect.top - 10,
      node: nodeData,
    })
  }, [])

  const handleMouseLeave = useCallback(() => setTooltip(null), [])

  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const target = e.target as SVGElement
      const nodeGroup = target.closest('.graph-node') as SVGGElement | null
      if (!nodeGroup) return
      const nodeData = d3.select<SVGGElement, GraphNode>(nodeGroup).datum()
      if (nodeData) navigate(`/lesson/${nodeData.id}`)
    },
    [navigate],
  )

  return (
    <div className="concept-graph-container" ref={containerRef}>
      <svg
        ref={svgRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      />

      {tooltip && (
        <div className="graph-tooltip visible" style={{ left: tooltip.x, top: tooltip.y }}>
          <div className="graph-tooltip-title">
            {phaseIcons[tooltip.node.phase - 1] ?? ''} Day {tooltip.node.id}: {tooltip.node.title}
          </div>
          {tooltip.node.concepts.length > 0 && (
            <div className="graph-tooltip-concepts">
              {tooltip.node.concepts.slice(0, 5).map((c) => (
                <span key={c} className="graph-tooltip-concept">
                  {c}
                </span>
              ))}
            </div>
          )}
          <div style={{ fontSize: '0.65rem', color: 'rgba(148,163,184,0.6)', marginTop: '4px' }}>
            Click to open lesson
          </div>
        </div>
      )}
    </div>
  )
}
