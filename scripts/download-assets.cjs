#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const https = require('https')

function safeRead(p) {
  try { return JSON.parse(fs.readFileSync(p,'utf8')) } catch (e) { return null }
}

const repoRoot = process.cwd()
const manifestPath = path.join(repoRoot, 'public/assets/manifest.api.json')
const manifest = safeRead(manifestPath)
if (!manifest) {
  console.error('manifest not found at', manifestPath)
  process.exit(1)
}

const outDir = path.join(repoRoot, 'public/assets')
fs.mkdirSync(outDir, { recursive: true })

function download(url, dest, redirects = 5) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    try {
      const u = new URL(url)
      const options = {
        hostname: u.hostname,
        path: u.pathname + u.search,
        protocol: u.protocol,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
          'Referer': 'https://wiki.warframe.com/'
        }
      }
      const req = https.get(options, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirects > 0) {
          res.destroy()
          // resolve relative redirects
          const next = new URL(res.headers.location, u).toString()
          return resolve(download(next, dest, redirects - 1))
        }
        if (res.statusCode !== 200) {
          res.resume()
          file.close()
          fs.unlink(dest, () => {})
          return reject(new Error('HTTP ' + res.statusCode + ' for ' + url))
        }
        res.pipe(file)
        file.on('finish', () => file.close(() => resolve()))
      })
      req.on('error', (err) => {
        file.close()
        fs.unlink(dest, () => {})
        reject(err)
      })
    } catch (e) {
      file.close()
      fs.unlink(dest, () => {})
      reject(e)
    }
  })
}

function gather() {
  const items = []
  for (const [k,v] of Object.entries(manifest.warframes || {})) {
    const img = v.imageName || null
    const url = v.wikiaThumbnail || null
    if (img && url) items.push({ key: k, imageName: img, url, type: 'warframe' })
  }
  for (const [k,v] of Object.entries(manifest.weapons || {})) {
    const img = v.imageName || null
    const url = v.wikiaThumbnail || null
    if (img && url) items.push({ key: k, imageName: img, url, type: 'weapon' })
  }
  return items
}

async function run() {
  const items = gather()
  console.log('Will attempt to download', items.length, 'images')
  const concurrency = 8
  let idx = 0
  let succeeded = 0
  let failed = 0

  async function worker() {
    while (true) {
      const i = idx++
      if (i >= items.length) break
      const it = items[i]
      const dest = path.join(outDir, it.imageName)
      if (fs.existsSync(dest)) {
        process.stdout.write('.')
        succeeded++
        continue
      }
      try {
        await download(it.url, dest)
        process.stdout.write('+')
        succeeded++
      } catch (e) {
        process.stdout.write('x')
        failed++
        console.error('\nFailed', it.key, it.imageName, e.message)
      }
    }
  }

  const workers = Array.from({length: concurrency}, () => worker())
  await Promise.all(workers)
  console.log('\nDone. succeeded=', succeeded, 'failed=', failed)
}

run().catch(e => { console.error(e); process.exit(1) })
