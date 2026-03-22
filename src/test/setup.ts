// Mock localStorage for JSDOM
const store: Record<string, string> = {}

const localStorageMock = {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, value: string) => {
    store[key] = value.toString()
  },
  clear: () => {
    for (const key in store) delete store[key]
  },
  removeItem: (key: string) => {
    delete store[key]
  },
  length: 0,
  key: (_index: number): string | null => null,
}

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: () => {},
  writable: true,
})

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

// Mock HTMLElement.prototype.scrollIntoView
window.HTMLElement.prototype.scrollIntoView = function () {}
