import type { IncomingMessage, ServerResponse } from 'node:http'
import { requestUsesSecureCookie, serializeCookie, SESSION_COOKIE_NAME } from '../_lib/twitchAuth.js'

export default function handler(request: IncomingMessage, response: ServerResponse) {
  response.setHeader('Cache-Control', 'private, no-store, max-age=0')
  response.setHeader('Content-Type', 'application/json; charset=utf-8')

  if (request.method !== 'POST') {
    response.statusCode = 405
    response.setHeader('Allow', 'POST')
    response.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }

  response.setHeader('Set-Cookie', serializeCookie(SESSION_COOKIE_NAME, '', 0, requestUsesSecureCookie(request)))
  response.statusCode = 200
  response.end(JSON.stringify({ ok: true }))
}