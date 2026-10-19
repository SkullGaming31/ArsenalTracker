import type { IncomingMessage } from 'node:http'

export const MAX_COLLECTION_SNAPSHOT_BYTES = 2_000_000

export interface CollectionSnapshotInput {
  version: 1
  collections: {
    warframes: Record<string, unknown>[]
    weapons: Record<string, unknown>[]
    companions: Record<string, unknown>[]
  }
}

export interface StoredCollectionSnapshot extends CollectionSnapshotInput {
  user: {
    id: string
    login: string
    displayName: string
  }
  syncedAt: string
}

export async function readJsonBody(request: IncomingMessage, maxBytes: number): Promise<unknown> {
  const parsedBody = (request as IncomingMessage & { body?: unknown }).body
  if (parsedBody !== undefined) {
    const serialized = typeof parsedBody === 'string' ? parsedBody : JSON.stringify(parsedBody)
    if (Buffer.byteLength(serialized, 'utf8') > maxBytes) throw new RangeError('Request body too large')
    return typeof parsedBody === 'string' ? JSON.parse(parsedBody) : parsedBody
  }

  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += buffer.byteLength
    if (size > maxBytes) throw new RangeError('Request body too large')
    chunks.push(buffer)
  }

  if (size === 0) throw new SyntaxError('Empty request body')
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

function isNamedCollection(value: unknown): value is Record<string, unknown>[] {
  return Array.isArray(value) && value.every(item =>
    typeof item === 'object' && item !== null && typeof (item as Record<string, unknown>).name === 'string',
  )
}

export function isCollectionSnapshotInput(value: unknown): value is CollectionSnapshotInput {
  if (!value || typeof value !== 'object') return false
  const input = value as Partial<CollectionSnapshotInput>
  return input.version === 1 && Boolean(input.collections) &&
    isNamedCollection(input.collections?.warframes) &&
    isNamedCollection(input.collections?.weapons) &&
    isNamedCollection(input.collections?.companions)
}

export function collectionSnapshotPath(twitchUserId: string): string {
  if (!/^\d+$/.test(twitchUserId)) throw new TypeError('Invalid Twitch user id')
  return `collections/v1/${twitchUserId}.json`
}