#!/usr/bin/env node
const https = require('https')
const fs = require('fs')
const path = require('path')

function parseArgs() {
  const args = process.argv.slice(2)
  // new: support --resource (warframes|weapons) or --url (full url override)
  const out = { only: null, remove: null, language: 'en', output: null, resource: 'warframes', url: null }
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--only' && args[i+1]) { out.only = args[++i] }
    else if (a === '--remove' && args[i+1]) { out.remove = args[++i] }
    else if (a === '--language' && args[i+1]) { out.language = args[++i] }
    else if (a === '--output' && args[i+1]) { out.output = args[++i] }
    else if (a === '--resource' && args[i+1]) { out.resource = args[++i] }
    else if (a === '--url' && args[i+1]) { out.url = args[++i] }
  }
  return out
}

function fetchJson(url, redirects = 5) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirects > 0) {
        try {
          const loc = new URL(res.headers.location, url).toString()
          return resolve(fetchJson(loc, redirects - 1))
        } catch (e) {
          return reject(e)
        }
      }
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) } catch (e) { reject(e) }
      })
    }).on('error', reject)
  })
}

;(async function main(){
  const opts = parseArgs()
  const base = 'https://api.warframestat.us'
  const resource = opts.resource || 'warframes'
  const apiUrl = opts.url ? opts.url : `${base}/${resource}?language=${encodeURIComponent(opts.language)}`
  console.log('Fetching', apiUrl)
  try {
    const data = await fetchJson(apiUrl)
    // apply filters
    const onlyKeys = opts.only ? opts.only.split(',').map(s => s.trim()).filter(Boolean) : null
    const removeKeys = opts.remove ? opts.remove.split(',').map(s => s.trim()).filter(Boolean) : null
    const out = data.map(item => {
      if (!onlyKeys && !removeKeys) return item
      const obj = {}
      if (onlyKeys) {
        for (const k of onlyKeys) if (k in item) obj[k] = item[k]
      } else {
        Object.assign(obj, item)
      }
      if (removeKeys) for (const rk of removeKeys) delete obj[rk]
      return obj
    })
  // determine output path: explicit --output wins, otherwise default to src/data/<resource>.api.json
  const defaultName = `src/data/${resource}.api.json`
  const outPath = path.join(process.cwd(), opts.output || defaultName)
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8')
  console.log('Wrote', outPath)
  } catch (e) {
    console.error('Failed to fetch', e)
    process.exit(1)
  }
})()
