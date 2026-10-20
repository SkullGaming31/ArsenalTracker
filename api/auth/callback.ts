import type { IncomingMessage, ServerResponse } from 'node:http'
import {
  getTwitchConfig,
  OAUTH_STATE_COOKIE_NAME,
  readCookie,
  requestUsesSecureCookie,
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  serializeCookie,
  signSession,
  type TwitchUser,
} from '../_lib/twitchAuth.js'

interface TokenResponse {
  access_token?: string
}

interface ValidationResponse {
  client_id?: string
  user_id?: string
  login?: string
}

function redirectWithError(response: ServerResponse, reason: string, clearStateCookie: string) {
  response.setHeader('Set-Cookie', clearStateCookie)
  response.statusCode = 303
  response.setHeader('Location', `/?twitch_login=error&reason=${reason}`)
  response.end()
}

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== 'GET') {
    response.statusCode = 405
    response.setHeader('Allow', 'GET')
    response.end()
    return
  }

  const secure = requestUsesSecureCookie(request)
  const clearStateCookie = serializeCookie(OAUTH_STATE_COOKIE_NAME, '', 0, secure)
  const config = getTwitchConfig()
  if (!config) {
    redirectWithError(response, 'not-configured', clearStateCookie)
    return
  }

  const callbackUrl = new URL(request.url ?? '/', 'http://localhost')
  if (callbackUrl.searchParams.has('error')) {
    redirectWithError(response, 'cancelled', clearStateCookie)
    return
  }

  const code = callbackUrl.searchParams.get('code')
  const returnedState = callbackUrl.searchParams.get('state')
  const savedState = readCookie(request, OAUTH_STATE_COOKIE_NAME)
  if (!code || !returnedState || !savedState || returnedState !== savedState) {
    redirectWithError(response, 'invalid-state', clearStateCookie)
    return
  }

  try {
    const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: config.redirectUri,
      }),
    })
    if (!tokenResponse.ok) throw new Error('Twitch token exchange failed')
    const token = await tokenResponse.json() as TokenResponse
    if (!token.access_token) throw new Error('Twitch token exchange returned no access token')

    const validationResponse = await fetch('https://id.twitch.tv/oauth2/validate', {
      headers: { Authorization: `OAuth ${token.access_token}` },
    })
    if (!validationResponse.ok) throw new Error('Twitch token validation failed')
    const validation = await validationResponse.json() as ValidationResponse
    if (
      validation.client_id !== config.clientId ||
      !validation.user_id ||
      !validation.login
    ) throw new Error('Twitch token validation returned no user')

    const user: TwitchUser = {
      id: validation.user_id,
      login: validation.login,
      displayName: validation.login,
    }
    const session = signSession(user, config.sessionSecret)
    response.setHeader('Cache-Control', 'no-store')
    response.setHeader('Set-Cookie', [
      clearStateCookie,
      serializeCookie(SESSION_COOKIE_NAME, session, SESSION_TTL_SECONDS, secure),
    ])
    response.statusCode = 303
    response.setHeader('Location', '/?twitch_login=success')
    response.end()
  } catch {
    redirectWithError(response, 'provider-error', clearStateCookie)
  }
}