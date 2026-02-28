import type { IncomingMessage, ServerResponse } from 'node:http'

export class InternalApiError extends Error {
  kind: string
  details: string
  headers: Record<string, string>

  constructor(kind: string, details: string, options?: { headers?: Record<string, string> })
}

export function handleGenerate(req: IncomingMessage, res: ServerResponse): Promise<void>
export function handleEmbed(req: IncomingMessage, res: ServerResponse): Promise<void>
export function withErrorHandling(
  handler: (req: IncomingMessage, res: ServerResponse) => Promise<void>,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void>
