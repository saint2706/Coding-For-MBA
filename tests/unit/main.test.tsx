import { afterEach, describe, expect, it, vi } from 'vitest'

const renderMock = vi.fn()
const toasterMarker = vi.fn(() => null)
const appMarker = vi.fn(() => null)

vi.mock('react-dom/client', () => ({
  default: {
    createRoot: vi.fn(() => ({
      render: renderMock,
    })),
  },
  createRoot: vi.fn(() => ({
    render: renderMock,
  })),
}))

vi.mock('react-hot-toast', () => ({
  Toaster: toasterMarker,
}))

vi.mock('../../src/App', () => ({
  default: appMarker,
}))

const elementTreeContainsType = (node: unknown, type: unknown): boolean => {
  if (!node || typeof node !== 'object') {
    return false
  }

  if ('type' in node && node.type === type) {
    return true
  }

  if (!('props' in node) || !node.props || typeof node.props !== 'object') {
    return false
  }

  if (!('children' in node.props)) {
    return false
  }

  const children = node.props.children
  if (Array.isArray(children)) {
    return children.some((child) => elementTreeContainsType(child, type))
  }

  return elementTreeContainsType(children, type)
}

describe('main entrypoint', () => {
  afterEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })

  it('renders app shell with Toaster mounted inside providers', async () => {
    document.body.innerHTML = '<div id="root"></div>'

    await import('../../src/main')

    expect(renderMock).toHaveBeenCalledTimes(1)

    const renderedTree = renderMock.mock.calls[0]?.[0]
    expect(elementTreeContainsType(renderedTree, appMarker)).toBe(true)
    expect(elementTreeContainsType(renderedTree, toasterMarker)).toBe(true)
  })
})
