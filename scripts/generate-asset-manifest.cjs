#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

function safeRead(p) {
  try { return JSON.parse(fs.readFileSync(p,'utf8')) } catch (e) { return [] }
}

const repoRoot = process.cwd()
const warframesPath = path.join(repoRoot, 'src/data/warframes.api.json')
const weaponsPath = path.join(repoRoot, 'src/data/weapons.api.json')

const warframes = safeRead(warframesPath)
const weapons = safeRead(weaponsPath)

const manifest = { warframes: {}, weapons: {} }

for (const w of warframes) {
  manifest.warframes[w.name || w.uniqueName || 'unknown'] = {
    name: w.name || null,
    uniqueName: w.uniqueName || null,
    imageName: w.imageName || null,
    wikiaThumbnail: w.wikiaThumbnail || null
  }
}

for (const w of weapons) {
  manifest.weapons[w.name || w.uniqueName || 'unknown'] = {
    name: w.name || null,
    uniqueName: w.uniqueName || null,
    imageName: w.imageName || null,
    wikiaThumbnail: w.wikiaThumbnail || null
  }
}

const outDir = path.join(repoRoot, 'public/assets')
fs.mkdirSync(outDir, { recursive: true })
const outPath = path.join(outDir, 'manifest.api.json')
fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2), 'utf8')
console.log('Wrote', outPath)
