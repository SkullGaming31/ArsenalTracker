import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import type { IncomingMessage } from 'node:http'

export const SESSION_COOKIE_NAME = 'arsenal_session'
export const OAUTH_STATE_COOKIE_NAME = 'arsenal_oauth_state'
export const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60

export interface TwitchUser {
  id: string
  login: string
  displayName: string
}

interface SessionPayload extends TwitchUser {
  expiresAt: number
}

export interface TwitchConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  sessionSecret: string
}

export interface TwitchExtensionConfig {
  clientId: string
  secret: Buffer
  origins: string[]
}

export interface TwitchExtensionIdentity {
  userId: string
  channelId: string
  role: 'broadcaster' | 'moderator' | 'viewer'
}

export function getTwitchConfig(): TwitchConfig | null {
  const clientId = process.env.TWITCH_CLIENT_ID
  const clientSecret = process.env.TWITCH_CLIENT_SECRET
  const redirectUri = process.env.TWITCH_REDIRECT_URI
  const sessionSecret = process.env.SESSION_SECRET

  if (!clientId || !clientSecret || !redirectUri || !sessionSecret || sessionSecret.length < 32) return null

  try {
    const callback = new URL(redirectUri)
    const isLocal = callback.hostname === 'localhost' || callback.hostname === '127.0.0.1'
    if ((callback.protocol !== 'https:' && !isLocal) || callback.pathname !== '/api/auth/callback') return null
  } catch {
    return null
  }

  return { clientId, clientSecret, redirectUri, sessionSecret }
}

export function getTwitchExtensionConfig(): TwitchExtensionConfig | null {
  const clientId = process.env.TWITCH_EXTENSION_CLIENT_ID
  const encodedSecret = process.env.TWITCH_EXTENSION_SECRET
  const originSetting = process.env.TWITCH_EXTENSION_ORIGIN
  if (!clientId || !encodedSecret || !originSetting) return null

  const secret = Buffer.from(encodedSecret, 'base64')
  if (secret.length < 32) return null
  const origins = originSetting.split(',').map(value => value.trim()).filter(Boolean)
  if (origins.length === 0 || origins.some(origin => {
    try {
      const parsed = new URL(origin)
      return parsed.origin !== origin || (parsed.protocol !== 'https:' && parsed.hostname !== 'localhost')
    } catch {
      return true
    }
  })) return null

  return { clientId, secret, origins }
}

export function verifyTwitchExtensionToken(
  token: string | null,
  config: TwitchExtensionConfig,
  now = Date.now(),
): TwitchExtensionIdentity | null {
  if (!token || token.length > 8192) return null

  const [encodedHeader, encodedPayload, encodedSignature, extra] = token.split('.')
  if (!encodedHeader || !encodedPayload || !encodedSignature || extra !== undefined) return null

  const expectedSignature = createHmac('sha256', config.secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest()
  let actualSignature: Buffer
  try {
    actualSignature = Buffer.from(encodedSignature, 'base64url')
  } catch {
    return null
  }
  if (actualSignature.length !== expectedSignature.length || !timingSafeEqual(actualSignature, expectedSignature)) return null

  try {
    const header = JSON.parse(Buffer.from(encodedHeader, 'base64url').toString('utf8')) as { alg?: unknown }
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as Record<string, unknown>
    const audience = payload.aud
    const audienceMatches = audience === undefined || audience === config.clientId ||
      (Array.isArray(audience) && audience.includes(config.clientId))
    const role = payload.role
    const isAllowedRole = role === 'broadcaster' || role === 'moderator' || role === 'viewer'

    if (
      header.alg !== 'HS256' ||
      !audienceMatches ||
      typeof payload.exp !== 'number' ||
      payload.exp <= Math.floor(now / 1000) ||
      typeof payload.channel_id !== 'string' ||
      typeof payload.opaque_user_id !== 'string' ||
      !payload.opaque_user_id.startsWith('U') ||
      typeof payload.user_id !== 'string' ||
      !/^\d+$/.test(payload.user_id) ||
      (payload.is_unlinked === true || payload.is_unlinked === 'true') ||
      !isAllowedRole
    ) return null

    return {
      userId: payload.user_id,
      channelId: payload.channel_id,
      role,
    }
  } catch {
    return null
  }
}

export function createOAuthState(): string {
  return randomBytes(32).toString('base64url')
}

export function readCookie(request: IncomingMessage, name: string): string | null {
  const cookieHeader = request.headers.cookie
  if (!cookieHeader) return null

  for (const item of cookieHeader.split(';')) {
    const separator = item.indexOf('=')
    if (separator < 0 || item.slice(0, separator).trim() !== name) continue
    return item.slice(separator + 1).trim()
  }

  return null
}

export function serializeCookie(name: string, value: string, maxAge: number, secure: boolean): string {
  const secureAttribute = secure ? '; Secure' : ''
  return `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secureAttribute}`
}

export function requestUsesSecureCookie(request: IncomingMessage): boolean {
  const forwardedProtocol = request.headers['x-forwarded-proto']
  const protocol = Array.isArray(forwardedProtocol) ? forwardedProtocol[0] : forwardedProtocol
  return protocol === 'https' || process.env.NODE_ENV === 'production'
}

export function signSession(user: TwitchUser, secret: string, now = Date.now()): string {
  const payload: SessionPayload = {
    ...user,
    expiresAt: now + SESSION_TTL_SECONDS * 1000,
  }
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = createHmac('sha256', secret).update(encodedPayload).digest('base64url')
  return `${encodedPayload}.${signature}`
}

export function readSession(token: string | null, secret: string, now = Date.now()): TwitchUser | null {
  if (!token || token.length > 4096) return null

  const [encodedPayload, encodedSignature, extra] = token.split('.')
  if (!encodedPayload || !encodedSignature || extra !== undefined) return null

  const expectedSignature = createHmac('sha256', secret).update(encodedPayload).digest()
  let actualSignature: Buffer
  try {
    actualSignature = Buffer.from(encodedSignature, 'base64url')
  } catch {
    return null
  }
  if (actualSignature.length !== expectedSignature.length || !timingSafeEqual(actualSignature, expectedSignature)) return null

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as Partial<SessionPayload>
    if (
      typeof payload.id !== 'string' ||
      typeof payload.login !== 'string' ||
      typeof payload.displayName !== 'string' ||
      typeof payload.expiresAt !== 'number' ||
      payload.expiresAt <= now
    ) return null

    return { id: payload.id, login: payload.login, displayName: payload.displayName }
  } catch {
    return null
  }
}