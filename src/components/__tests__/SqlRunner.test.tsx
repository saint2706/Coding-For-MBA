import { render, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import SqlRunner, { type SqlRunnerHandle } from '../SqlRunner'
import * as useSqlJsHook from '../../hooks/useSqlJs'

vi.mock('../../hooks/useSqlJs', () => ({
  useSqlJs: vi.fn(),
}))

describe('SqlRunner', () => {
  let mockRunSql: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockRunSql = vi.fn()
    vi.mocked(useSqlJsHook.useSqlJs).mockReturnValue({
      loading: false,
      runSql: mockRunSql,
    } as unknown as ReturnType<typeof useSqlJsHook.useSqlJs>)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders idle state correctly', () => {
    const { getByRole } = render(<SqlRunner sql="SELECT 1;" />)
    expect(getByRole('button', { name: /Run SQL query/i })).toBeDefined()
  })

  it('renders loading state while sql.js loads', () => {
    vi.mocked(useSqlJsHook.useSqlJs).mockReturnValue({
      loading: true,
      runSql: mockRunSql,
    } as unknown as ReturnType<typeof useSqlJsHook.useSqlJs>)
    const { getByRole } = render(<SqlRunner sql="SELECT 1;" />)
    const runBtn = getByRole('button', { name: /Loading SQL engine/i })
    expect(runBtn.hasAttribute('disabled')).toBe(true)
  })

  it('executes sql and renders a result table', async () => {
    mockRunSql.mockResolvedValue({
      results: [
        {
          columns: ['id', 'name'],
          values: [
            [1, 'Ada'],
            [2, 'Grace'],
          ],
        },
      ],
      error: null,
    })
    const onComplete = vi.fn()
    const { getByRole, findByText, getAllByRole } = render(
      <SqlRunner sql="SELECT * FROM users;" onExecutionComplete={onComplete} />,
    )

    fireEvent.click(getByRole('button', { name: /Run SQL query/i }))

    await findByText('Ada')
    expect(getAllByRole('columnheader').map((th) => th.textContent)).toEqual(['id', 'name'])
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({ error: null, results: expect.any(Array) }),
    )
  })

  it('renders an empty-result message when no rows are returned', async () => {
    mockRunSql.mockResolvedValue({ results: [], error: null })
    const { getByRole, findByText } = render(<SqlRunner sql="CREATE TABLE t(id INT);" />)

    fireEvent.click(getByRole('button', { name: /Run SQL query/i }))

    expect(await findByText(/no rows returned/i)).toBeDefined()
  })

  it('renders an error message', async () => {
    mockRunSql.mockResolvedValue({ results: [], error: 'near "SELEC": syntax error' })
    const { getByRole, findByText } = render(<SqlRunner sql="SELEC 1;" />)

    fireEvent.click(getByRole('button', { name: /Run SQL query/i }))

    expect(await findByText('near "SELEC": syntax error')).toBeDefined()
  })

  it('renders NULL cells distinctly', async () => {
    mockRunSql.mockResolvedValue({
      results: [{ columns: ['v'], values: [[null]] }],
      error: null,
    })
    const { getByRole, findByText } = render(<SqlRunner sql="SELECT NULL as v;" />)

    fireEvent.click(getByRole('button', { name: /Run SQL query/i }))

    const cell = await findByText('NULL')
    expect(cell.className).toContain('sql-runner__cell--null')
  })

  it('truncates large result sets', async () => {
    const values = Array.from({ length: 250 }, (_, i) => [i])
    mockRunSql.mockResolvedValue({ results: [{ columns: ['n'], values }], error: null })
    const { getByRole, findByText } = render(<SqlRunner sql="SELECT n FROM big;" />)

    fireEvent.click(getByRole('button', { name: /Run SQL query/i }))

    expect(await findByText(/Showing first 200 of 250 rows/)).toBeDefined()
  })

  it('allows imperative execution via ref', async () => {
    mockRunSql.mockResolvedValue({ results: [], error: null })
    const ref = React.createRef<SqlRunnerHandle>()
    const { findByText } = render(<SqlRunner ref={ref} sql="SELECT 1;" />)

    act(() => {
      ref.current?.run()
    })

    expect(await findByText(/no rows returned/i)).toBeDefined()
  })
})
