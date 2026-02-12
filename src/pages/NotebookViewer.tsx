import { useParams, Link } from 'react-router-dom'
import { Helmet } from '@dr.pogodin/react-helmet'
import { getNotebook, getPhase, phaseIcons, type NotebookCell } from '../utils/contentLoader'
import MarkdownRenderer from '../components/MarkdownRenderer'
import Breadcrumb from '../components/Breadcrumb'
import BackToTop from '../components/BackToTop'
import CodePlayground from '../components/CodePlayground'

// --- Cell merging logic ---
// Groups consecutive code cells into a single merged block so that
// all code for one solution/question is shown together and can run
// as a single unit in the CodePlayground.

interface MergedBlock {
    type: 'markdown' | 'code'
    /** For markdown: the raw source. For code: the merged source of all cells. */
    source: string
    /** Original cells (for code blocks — used for output rendering) */
    cells?: NotebookCell[]
}

function mergeCells(cells: NotebookCell[]): MergedBlock[] {
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
function stripAnsi(str: string): string {
    return str.replace(ANSI_REGEX, '')
}

function CellOutputs({ cells }: { cells: NotebookCell[] }) {
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
                            {output.traceback ? stripAnsi(output.traceback.join('\n')) : `${output.ename}: ${output.evalue}`}
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

function MergedBlockRenderer({ block, index }: { block: MergedBlock; index: number }) {
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
                    {block.cells!.length > 1
                        ? `${block.cells!.length} cells merged`
                        : block.cells![0]?.execution_count != null
                            ? `In [${block.cells![0].execution_count}]`
                            : ''}
                </span>
            </div>
            <CodePlayground initialCode={block.source} />
            <CellOutputs cells={block.cells!} />
        </div>
    )
}

// --- Main component ---

export default function NotebookViewer() {
    const { phaseNum } = useParams<{ phaseNum: string }>()
    const notebook = getNotebook(phaseNum!)
    const phase = getPhase(phaseNum!)
    const icon = phaseIcons[Number(phaseNum) - 1] || '📖'

    if (!notebook || notebook.cells.length === 0) {
        return (
            <div className="page-container">
                <Helmet>
                    <title>Solutions Not Found — Coding for MBA</title>
                </Helmet>
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
            <Helmet>
                <title>
                    {title} Solutions — Coding for MBA
                </title>
                <meta
                    name="description"
                    content={`Solution notebook for ${title}. Complete Python solutions with explanations.`}
                />
            </Helmet>
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
