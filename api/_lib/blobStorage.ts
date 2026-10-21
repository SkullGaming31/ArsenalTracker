export function getBlobOptions(): { token: string } {
  const token = process.env.BLOB_READ_WRITE_TOKEN || process.env.prod_blob_READ_WRITE_TOKEN
  if (!token) throw new Error('Missing BLOB_READ_WRITE_TOKEN or prod_blob_READ_WRITE_TOKEN')
  return { token }
}
