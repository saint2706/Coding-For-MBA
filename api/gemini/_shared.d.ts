import type { IncomingMessage, ServerResponse } from 'node:http'

export function handleGenerate(req: IncomingMessage, res: ServerResponse): Promise<void>
export function handleEmbed(req: IncomingMessage, res: ServerResponse): Promise<void>
export function withErrorHandling(
  handler: (req: IncomingMessage, res: ServerResponse) => Promise<void>,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void>
