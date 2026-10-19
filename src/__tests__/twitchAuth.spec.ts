import { describe, expect, it } from 'vitest'
import {
  readSession,
  SESSION_TTL_SECONDS,
  signSession,
  verifyTwitchExtensionToken,
  type TwitchExtensionConfig,
  type TwitchUser,
} from '../../api/_lib/twitchAuth'
import { createHmac } from 'node:crypto'

const user: TwitchUser = {
  id: '12345',
  login: 'arsenal_user',
  displayName: 'arsenal_user',
}
const secret = 'test-session-secret-that-is-long-enough'
const extensionSecret = Buffer.alloc(32, 7)
const extensionConfig: TwitchExtensionConfig = {
  clientId: 'extension-client',
  secret: extensionSecret,
  origins: ['https://extension.test'],
}

function signExtensionToken(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = createHmac('sha256', extensionSecret).update(`${header}.${body}`).digest('base64url')
  return `${header}.${body}.${signature}`
}

describe('Twitch session cookies', () => {
  it('accepts a valid signed session', () => {
    const token = signSession(user, secret, 1000)

    expect(readSession(token, secret, 1001)).toEqual(user)
  })

  it('rejects tampered, incorrectly signed, and expired sessions', () => {
    const token = signSession(user, secret, 1000)
    const [payload] = token.split('.')

    expect(readSession(`${payload}.invalid`, secret, 1001)).toBeNull()
    expect(readSession(token, `${secret}-wrong`, 1001)).toBeNull()
    expect(readSession(token, secret, 1000 + SESSION_TTL_SECONDS * 1000)).toBeNull()
  })
})

describe('Twitch Extension JWTs', () => {
  it('accepts a valid linked viewer token', () => {
    const token = signExtensionToken({
      exp: 2000,
      channel_id: 'channel-1',
      opaque_user_id: 'U123',
      user_id: '123',
      role: 'viewer',
      aud: extensionConfig.clientId,
    })

    expect(verifyTwitchExtensionToken(token, extensionConfig, 1000)).toEqual({
      userId: '123',
      channelId: 'channel-1',
      role: 'viewer',
    })
  })

  it('rejects invalid, expired, unlinked, and mismatched-audience tokens', () => {
    const base = {
      exp: 2000,
      channel_id: 'channel-1',
      opaque_user_id: 'U123',
      user_id: '123',
      role: 'viewer',
    }

    expect(verifyTwitchExtensionToken('bad.token.value', extensionConfig, 1000)).toBeNull()
    expect(verifyTwitchExtensionToken(signExtensionToken({ ...base, exp: 0 }), extensionConfig, 1000)).toBeNull()
    expect(verifyTwitchExtensionToken(signExtensionToken({ ...base, is_unlinked: true }), extensionConfig, 1000)).toBeNull()
    expect(verifyTwitchExtensionToken(signExtensionToken({ ...base, aud: 'other-client' }), extensionConfig, 1000)).toBeNull()
    expect(verifyTwitchExtensionToken(signExtensionToken({ ...base, user_id: undefined }), extensionConfig, 1000)).toBeNull()
  })
})