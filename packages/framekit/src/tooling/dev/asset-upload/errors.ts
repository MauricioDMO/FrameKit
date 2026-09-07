import type { ServerResponse } from 'node:http'

export class AssetUploadError extends Error {
  constructor (public readonly statusCode: number, message: string) {
    super(message)
  }
}

export function sendJson (response: ServerResponse, statusCode: number, body: Record<string, string>): void {
  const payload = JSON.stringify(body)
  response.statusCode = statusCode
  response.setHeader('content-type', 'application/json; charset=utf-8')
  response.setHeader('content-length', Buffer.byteLength(payload))
  response.end(payload)
}
