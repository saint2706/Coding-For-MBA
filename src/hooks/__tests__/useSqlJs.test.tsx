import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type { useSqlJs as useSqlJsType } from '../useSqlJs'

const mockExec = vi.fn()
const mockClose = vi.fn()
const mockDatabaseCtor = vi.fn().mockImplementation(function () {
  return { exec: mockExec, close: mockClose }
})
const mockInitSqlJs = vi.fn().mockResolvedValue({ Database: mockDatabaseCtor })

vi.mock('sql.js', () => ({
  default: (...args: unknown[]) => mockInitSqlJs(...args),
}))

vi.mock('sql.js/dist/sql-wasm.wasm?url', () => ({
  default: 'sql-wasm.wasm',
}))

describe('useSqlJs', () => {
  let container: HTMLDivElement
  let root: Root

  let useSqlJs: typeof useSqlJsType

  beforeEach(async () => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    mockExec.mockReset()
    mockClose.mockReset()
    mockDatabaseCtor.mockClear()
    mockInitSqlJs.mockClear()
    vi.resetModules()
    ;({ useSqlJs } = await import('../useSqlJs'))
  })

  afterEach(() => {
    act(() => root.unmount())
    document.body.removeChild(container)
    vi.restoreAllMocks()
  })

  it('runs sql against a fresh database and returns results', async () => {
    mockExec.mockReturnValue([{ columns: ['a'], values: [[1]] }])

    let hookResult: ReturnType<typeof useSqlJs>
    function TestComponent() {
      hookResult = useSqlJs()
      return null
    }

    await act(async () => {
      root.render(<TestComponent />)
    })

    let result: Awaited<ReturnType<ReturnType<typeof useSqlJs>['runSql']>>
    await act(async () => {
      result = await hookResult!.runSql('SELECT 1 as a;')
    })

    expect(result!.error).toBeNull()
    expect(result!.results).toEqual([{ columns: ['a'], values: [[1]] }])
    expect(mockExec).toHaveBeenCalledWith('SELECT 1 as a;')
    expect(mockClose).toHaveBeenCalledTimes(1)
  })

  it('closes the database and returns an error message when exec throws', async () => {
    mockExec.mockImplementation(() => {
      throw new Error('near "SELEC": syntax error')
    })

    let hookResult: ReturnType<typeof useSqlJs>
    function TestComponent() {
      hookResult = useSqlJs()
      return null
    }

    await act(async () => {
      root.render(<TestComponent />)
    })

    let result: Awaited<ReturnType<ReturnType<typeof useSqlJs>['runSql']>>
    await act(async () => {
      result = await hookResult!.runSql('SELEC 1;')
    })

    expect(result!.results).toEqual([])
    expect(result!.error).toBe('near "SELEC": syntax error')
    expect(mockClose).toHaveBeenCalledTimes(1)
  })

  it('only initializes sql.js once across multiple runs', async () => {
    mockExec.mockReturnValue([])

    let hookResult: ReturnType<typeof useSqlJs>
    function TestComponent() {
      hookResult = useSqlJs()
      return null
    }

    await act(async () => {
      root.render(<TestComponent />)
    })

    await act(async () => {
      await hookResult!.runSql('CREATE TABLE t(id INT);')
      await hookResult!.runSql('SELECT * FROM t;')
    })

    expect(mockInitSqlJs).toHaveBeenCalledTimes(1)
    expect(mockDatabaseCtor).toHaveBeenCalledTimes(2)
  })
})
