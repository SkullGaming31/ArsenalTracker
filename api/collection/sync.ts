import { put } from '@vercel/blob'
import type { IncomingMessage, ServerResponse } from 'node:http'
import {
  collectionSnapshotPath,
  isCollectionSnapshotInput,
  MAX_COLLECTION_SNAPSHOT_BYTES,
  readJsonBody,
  type StoredCollectionSnapshot,
} from '../_lib/collectionSnapshot.js'
import {
  getTwitchConfig,
  readCookie,
  readSession,
  SESSION_COOKIE_NAME,
} from '../_lib/twitchAuth.js'

function sendJson(response: ServerResponse, statusCode: number, body: Record<string, unknown>) {
  response.statusCode = statusCode
  response.setHeader('Cache-Control', 'private, no-store, max-age=0')
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.end(JSON.stringify(body))
}

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    sendJson(response, 405, { error: 'Method not allowed' })
    return
  }

  const config = getTwitchConfig()
  const user = config
    ? readSession(readCookie(request, SESSION_COOKIE_NAME), config.sessionSecret)
    : null
  if (!user) {
    sendJson(response, 401, { error: 'Sign in with Twitch before syncing.' })
    return
  }

  const origin = request.headers.origin
  const host = request.headers.host
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) {
        sendJson(response, 403, { error: 'Cross-origin sync requests are not allowed.' })
        return
      }
    } catch {
      sendJson(response, 403, { error: 'Invalid request origin.' })
      return
    }
  }

  let input: unknown
  try {
    input = await readJsonBody(request, MAX_COLLECTION_SNAPSHOT_BYTES)
  } catch (error) {
    sendJson(response, error instanceof RangeError ? 413 : 400, {
      error: error instanceof RangeError ? 'Collection snapshot is too large.' : 'Invalid JSON body.',
    })
    return
  }
  if (!isCollectionSnapshotInput(input)) {
    sendJson(response, 400, { error: 'Collection snapshot format is invalid.' })
    return
  }

  const snapshot: StoredCollectionSnapshot = {
    ...input,
    user: { id: user.id, login: user.login, displayName: user.displayName },
    syncedAt: new Date().toISOString(),
  }

  try {
    const json = JSON.stringify(snapshot)
    if (Buffer.byteLength(json, 'utf8') > MAX_COLLECTION_SNAPSHOT_BYTES) {
      sendJson(response, 413, { error: 'Collection snapshot is too large.' })
      return
    }
    await put(collectionSnapshotPath(user.id), json, {
      access: 'private',
      allowOverwrite: true,
      addRandomSuffix: false,
      contentType: 'application/json; charset=utf-8',
    })
    sendJson(response, 200, {
      ok: true,
      syncedAt: snapshot.syncedAt,
      counts: {
        warframes: snapshot.collections.warframes.length,
        weapons: snapshot.collections.weapons.length,
        companions: snapshot.collections.companions.length,
      },
    })
  } catch {
    sendJson(response, 503, { error: 'Collection storage is unavailable. Check the private Blob store configuration.' })
  }
}