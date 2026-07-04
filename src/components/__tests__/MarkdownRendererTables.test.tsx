import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import MarkdownRenderer from '../MarkdownRenderer'

describe('MarkdownRenderer Tables', () => {
  let container: HTMLDivElement | null = null

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    if (container) {
      document.body.removeChild(container)
      container = null
    }
  })

  it('wraps tables in a scrollable wrapper with overflow-fade data attributes', async () => {
    const content = '| A | B |\n|---|---|\n| 1 | 2 |\n'

    await act(async () => {
      const root = createRoot(container!)
      root.render(<MarkdownRenderer content={content} />)
    })

    const wrapper = container?.querySelector('.table-wrapper')
    expect(wrapper).not.toBeNull()
    expect(wrapper?.getAttribute('data-overflow-left')).toBe('false')
    expect(wrapper?.getAttribute('data-overflow-right')).toBe('false')

    const scroll = wrapper?.querySelector('.table-scroll')
    expect(scroll).not.toBeNull()
    expect(scroll?.querySelector('table')).not.toBeNull()
  })
})
