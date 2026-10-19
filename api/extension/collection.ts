import { get } from '@vercel/blob'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { collectionSnapshotPath } from '../_lib/collectionSnapshot'
import {
  getTwitchExtensionConfig,
  verifyTwitchExtensionToken,
} from '../_lib/twitchAuth'

function sendJson(response: ServerResponse, statusCode: number, body: Record<string, unknown>) {
  response.statusCode = statusCode
  response.setHeader('Cache-Control', 'private, no-store, max-age=0')
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.end(JSON.stringify(body))
}

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  const config = getTwitchExtensionConfig()
  if (!config) {
    sendJson(response, 503, { error: 'Twitch Extension API is not configured.' })
    return
  }

  const origin = request.headers.origin
  if (origin) {
    if (!config.origins.includes(origin)) {
      sendJson(response, 403, { error: 'Origin is not allowed.' })
      return
    }
    response.setHeader('Access-Control-Allow-Origin', origin)
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    response.setHeader('Access-Control-Allow-Headers', 'Authorization')
    response.setHeader('Access-Control-Max-Age', '600')
    response.setHeader('Vary', 'Origin')
  }

  if (request.method === 'OPTIONS') {
    response.statusCode = 204
    response.end()
    return
  }
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET, OPTIONS')
    sendJson(response, 405, { error: 'Method not allowed' })
    return
  }

  const authorization = request.headers.authorization
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1] ?? null
  const identity = verifyTwitchExtensionToken(token, config)
  if (!identity) {
    sendJson(response, 401, { error: 'A valid Twitch Extension token with linked viewer identity is required.' })
    return
  }

  try {
    const snapshot = await get(collectionSnapshotPath(identity.userId), {
      access: 'private',
      useCache: false,
    })
    if (!snapshot || snapshot.statusCode !== 200) {
      sendJson(response, 404, { error: 'No synced collection exists for this Twitch account.' })
      return
    }
    const body = await new Response(snapshot.stream).json() as Record<string, unknown>
    sendJson(response, 200, body)
  } catch {
    sendJson(response, 503, { error: 'Collection storage is unavailable.' })
  }
}