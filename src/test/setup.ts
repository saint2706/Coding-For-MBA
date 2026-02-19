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

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})
