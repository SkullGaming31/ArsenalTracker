import type { IncomingMessage, ServerResponse } from 'node:http'
import {
  getTwitchConfig,
  readCookie,
  readSession,
  SESSION_COOKIE_NAME,
} from '../_lib/twitchAuth'

export default function handler(request: IncomingMessage, response: ServerResponse) {
  response.setHeader('Cache-Control', 'private, no-store, max-age=0')
  response.setHeader('Pragma', 'no-cache')
  response.setHeader('Content-Type', 'application/json; charset=utf-8')

  if (request.method !== 'GET') {
    response.statusCode = 405
    response.setHeader('Allow', 'GET')
    response.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }

  const config = getTwitchConfig()
  const user = config
    ? readSession(readCookie(request, SESSION_COOKIE_NAME), config.sessionSecret)
    : null

  response.statusCode = 200
  response.end(JSON.stringify({ configured: Boolean(config), user }))
}