import { EventEmitter } from 'node:events'

import { describe, expect, it, vi } from 'vitest'

import { parseJsonBody } from '../../../api/gemini/_shared.js'

class MockRequest extends EventEmitter {
  destroyed = false
  destroy = vi.fn(() => {
    this.destroyed = true
    return this
  })
}

describe('parseJsonBody', () => {
  it('rejects oversized payloads, destroys stream, and settles only once', async () => {
    const req = new MockRequest()
    const promise = parseJsonBody(req as never)

    const settleSpy = vi.fn()
    promise.then(
      () => settleSpy('resolved'),
      (error) => settleSpy(`rejected:${(error as Error).message}`),
    )

    req.emit('data', 'x'.repeat(100_001))
    req.emit('end')

    await expect(promise).rejects.toThrow('Payload too large')

    await new Promise((resolve) => setImmediate(resolve))

    expect(req.destroy).toHaveBeenCalledTimes(1)
    expect(settleSpy).toHaveBeenCalledTimes(1)
    expect(settleSpy).toHaveBeenCalledWith('rejected:Payload too large')
    expect(req.listenerCount('data')).toBe(0)
    expect(req.listenerCount('end')).toBe(0)
    expect(req.listenerCount('error')).toBe(0)
  })

  it('rejects malformed JSON payloads', async () => {
    const req = new MockRequest()
    const promise = parseJsonBody(req as never)

    req.emit('data', '{"broken":')
    req.emit('end')

    await expect(promise).rejects.toThrow('Invalid JSON payload')
  })
})
