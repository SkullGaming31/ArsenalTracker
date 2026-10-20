import type { IncomingMessage, ServerResponse } from 'node:http'
import {
  createOAuthState,
  getTwitchConfig,
  OAUTH_STATE_COOKIE_NAME,
  requestUsesSecureCookie,
  serializeCookie,
} from '../_lib/twitchAuth.js'

export default function handler(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== 'GET') {
    response.statusCode = 405
    response.setHeader('Allow', 'GET')
    response.end()
    return
  }

  const config = getTwitchConfig()
  if (!config) {
    response.statusCode = 303
    response.setHeader('Location', '/?twitch_login=error&reason=not-configured')
    response.end()
    return
  }

  const state = createOAuthState()
  const authorizeUrl = new URL('https://id.twitch.tv/oauth2/authorize')
  authorizeUrl.searchParams.set('client_id', config.clientId)
  authorizeUrl.searchParams.set('redirect_uri', config.redirectUri)
  authorizeUrl.searchParams.set('response_type', 'code')
  authorizeUrl.searchParams.set('state', state)

  response.setHeader('Cache-Control', 'no-store')
  response.setHeader(
    'Set-Cookie',
    serializeCookie(OAUTH_STATE_COOKIE_NAME, state, 10 * 60, requestUsesSecureCookie(request)),
  )
  response.statusCode = 302
  response.setHeader('Location', authorizeUrl.toString())
  response.end()
}