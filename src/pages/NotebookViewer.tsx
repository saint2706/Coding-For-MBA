/**
 * Jupyter Notebook Viewer
 *
 * Renders read-only Jupyter notebooks (Solutions) within the application.
 *
 * Key Responsibilities:
 * - Parse and render notebook cells (markdown, code, output).
 * - Match notebook to the correct phase via URL params.
 * - Provide a consistent reading experience for solutions.
 */

import { useParams, Link } from 'react-router-dom'
import SEOHead from '../components/SEOHead'
import { getNotebook, getPhase, phaseIcons, type NotebookCell } from '../utils/contentLoader'
import MarkdownRenderer from '../components/MarkdownRenderer'
import Breadcrumb from '../components/Breadcrumb'
import BackToTop from '../components/BackToTop'
import CodePlayground from '../components/CodePlayground'

// --- Cell merging logic ---
// Groups consecutive code cells into a single merged block so that
// all code for one solution/question is shown together and can run
// as a single unit in the CodePlayground.

/**
 * Represents a merged block of notebook content.
 *
 * Consecutive code cells are merged into a single executable block,
 * while markdown cells remain separate.
 */
interface MergedBlock {
  /** Type of the block - either markdown content or merged code */
  type: 'markdown' | 'code'
  /** For markdown: the raw source. For code: the merged source of all cells. */
  source: string
  /** Original cells (for code blocks — used for output rendering) */
  cells?: readonly NotebookCell[]
}

/**
 * Merges consecutive code cells into single executable blocks.
 *
 * This function groups adjacent code cells together so they can be executed
 * as a single unit, while keeping markdown cells separate for rendering.
 *
 * @param cells - Array of notebook cells to merge
 * @returns Array of merged blocks ready for rendering
 */
function mergeCells(cells: readonly NotebookCell[]): MergedBlock[] {
  const blocks: MergedBlock[] = []
  let currentCodeSources: string[] = []
  let currentCodeCells: NotebookCell[] = []

  function flushCode() {
    if (currentCodeSources.length > 0) {
      blocks.push({
        type: 'code',
        source: currentCodeSources.join('\n'),
        cells: currentCodeCells,
      })
      currentCodeSources = []
      currentCodeCells = []
    }
  }

  for (const cell of cells) {
    if (cell.cell_type === 'code') {
      currentCodeSources.push(cell.source.join('').replace(/\n$/, ''))
      currentCodeCells.push(cell)
    } else {
      flushCode()
      blocks.push({ type: 'markdown', source: cell.source.join('') })
    }
  }
  flushCode()

  return blocks
}

// --- Output rendering ---

// eslint-disable-next-line no-control-regex
const ANSI_REGEX = /\u001b\[[0-9;]*m/g

/**
 * Strips ANSI color codes from a string.
 *
 * Removes terminal color and formatting codes that may be present
 * in notebook output, particularly in error tracebacks.
 *
 * @param str - String potentially containing ANSI codes
 * @returns String with ANSI codes removed
 */
function stripAnsi(str: string): string {
  return str.replace(ANSI_REGEX, '')
}

/**
 * Props for the CellOutputs component.
 */
interface CellOutputsProps {
  /** Array of notebook cells to render outputs from */
  cells: readonly NotebookCell[]
}

/**
 * Renders the output from notebook code cells.
 *
 * Displays various types of output including:
 * - Stream output (stdout/stderr)
 * - Error tracebacks
 * - Result values (text/plain)
 *
 * @param props - Component props
 * @returns Rendered cell outputs or null if no outputs
 */
function CellOutputs({ cells }: CellOutputsProps) {
  const allOutputs = cells.flatMap((cell) => cell.outputs || [])
  if (allOutputs.length === 0) return null

  return (
    <div className="nb-output">
      <div className="nb-output__label">Output</div>
      {allOutputs.map((output, i) => {
        if (output.output_type === 'stream' && output.text) {
          return (
            <pre className="nb-output__text" key={i}>
              {output.text.join('')}
            </pre>
          )
        }
        if (output.output_type === 'error') {
          return (
            <pre className="nb-output__error" key={i}>
              {output.traceback
                ? stripAnsi(output.traceback.join('\n'))
                : `${output.ename}: ${output.evalue}`}
            </pre>
          )
        }
        if (output.data) {
          if (output.data['text/plain']) {
            return (
              <pre className="nb-output__text" key={i}>
                {output.data['text/plain'].join('')}
              </pre>
            )
          }
        }
        return null
      })}
    </div>
  )
}

// --- Block renderers ---

/**
 * Props for the MergedBlockRenderer component.
 */
interface MergedBlockRendererProps {
  /** The merged block to render */
  block: MergedBlock
  /** Index of the block in the notebook */
  index: number
}

/**
 * Renders a single merged block (markdown or code).
 *
 * Markdown blocks are rendered using the MarkdownRenderer component,
 * while code blocks use the CodePlayground for interactive execution
 * with original outputs displayed below.
 *
 * @param props - Component props
 * @returns Rendered block component
 */
function MergedBlockRenderer({ block, index }: MergedBlockRendererProps) {
  if (block.type === 'markdown') {
    return (
      <div className="nb-cell nb-cell--markdown" key={index}>
        <MarkdownRenderer content={block.source} />
      </div>
    )
  }

  // code block — uses CodePlayground for execution
  return (
    <div className="nb-cell nb-cell--code" key={index}>
      <div className="nb-cell__header">
        <span className="nb-cell__badge">Python</span>
        <span className="nb-cell__exec">
          {block.cells && block.cells.length > 1
            ? `${block.cells.length} cells merged`
            : block.cells && block.cells[0]?.execution_count != null
              ? `In [${block.cells[0].execution_count}]`
              : ''}
        </span>
      </div>
      <CodePlayground initialCode={block.source} />
      <CellOutputs cells={block.cells || []} />
    </div>
  )
}

// --- Main component ---

/**
 * Notebook viewer page component.
 *
 * Displays Jupyter notebooks (.ipynb files) with:
 * - Merged code cells for better readability
 * - Interactive code execution using CodePlayground
 * - Markdown content rendering
 * - Original cell outputs preserved
 * - Navigation breadcrumbs
 * - Back to exercises link
 *
 * @returns The rendered notebook viewer page or 404 if notebook not found
 */
export default function NotebookViewer() {
  const { phaseNum } = useParams<{ phaseNum: string }>()
  const notebook = phaseNum ? getNotebook(phaseNum) : undefined
  const phase = phaseNum ? getPhase(phaseNum) : undefined
  const icon = phaseIcons[Number(phaseNum) - 1] || '📖'

  if (!notebook || notebook.cells.length === 0) {
    return (
      <div className="page-container">
        <SEOHead
          title="Solutions Not Found"
          description="The requested solution notebook does not exist in the Coding for MBA curriculum."
          noIndex
        />
        <h1>Solutions not found</h1>
        <p>No solution notebook exists for Phase {phaseNum}.</p>
        <Link to="/exercises">← Back to Exercises</Link>
      </div>
    )
  }

  const title = phase ? `Phase ${phaseNum}: ${phase.title}` : `Phase ${phaseNum}`
  const mergedBlocks = mergeCells(notebook.cells)

  return (
    <div className="page-container">
      <SEOHead
        title={`${title} Solutions`}
        description={`Solution notebook for ${title}. Complete Python solutions with explanations.`}
        path={`/solutions/${phaseNum}`}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: `Phase ${phaseNum}`, url: `/phase/${phaseNum}` },
          { name: 'Solutions', url: `/solutions/${phaseNum}` },
        ]}
      />
      <Breadcrumb
        items={[
          { label: 'Home', to: '/' },
          { label: `Phase ${phaseNum}`, to: `/phase/${phaseNum}` },
          { label: 'Solutions' },
        ]}
      />

      <div className="section-header" style={{ marginBottom: '1.5rem' }}>
        <h2>
          {icon} {title} — Solutions
        </h2>
        <p>
          Complete solutions notebook — edit any code and click ▶ Run to execute in your browser.
        </p>
      </div>

      <div className="nb-container">
        {mergedBlocks.map((block, i) => (
          <MergedBlockRenderer block={block} index={i} key={i} />
        ))}
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Link to="/exercises" className="exercise-card__link" style={{ fontSize: '0.9375rem' }}>
          ← Back to Exercises
        </Link>
      </div>

      <BackToTop />
    </div>
  )
}
