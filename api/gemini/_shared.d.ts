import type { IncomingMessage, ServerResponse } from 'node:http'

export class InternalApiError extends Error {
  kind: string
  details: string
  headers: Record<string, string>

  constructor(kind: string, details: string, options?: { headers?: Record<string, string> })
}

export function handleGenerate(req: IncomingMessage, res: ServerResponse): Promise<void>
export function handleEmbed(req: IncomingMessage, res: ServerResponse): Promise<void>
export function parseJsonBody(req: NodeJS.EventEmitter): Promise<unknown>
export function checkRateLimit(
  req: {
    headers?: Record<string, string | string[] | undefined>
    socket?: { remoteAddress?: string | null }
    auth?: { userId?: string }
    sessionID?: string
    session?: { id?: string }
  },
  endpoint: string,
  maxRequests: number,
  windowMs: number,
  options?: {
    now?: number
    cleanupEveryNRequests?: number
    maxEntries?: number
  },
): {
  allowed: boolean
  retryAfterSeconds: number
}
export function __resetRateLimitStore(): void
export function __getRateLimitEntries(): Array<[string, { count: number; resetAt: number }]>
export function withErrorHandling(
  handler: (req: IncomingMessage, res: ServerResponse) => Promise<void>,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void>
