const fs = require('fs')
const path = require('path')
// lightweight CSV parser to avoid package export issues

function parseCSV(text) {
  const rows = []
  const lines = text.split(/\r?\n/)
  let headers = null
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue
    const cols = []
    let cur = ''
    let inQuotes = false
    for (let j = 0; j < line.length; j++) {
      const ch = line[j]
      if (ch === '"') {
        if (inQuotes && line[j+1] === '"') { cur += '"'; j++; continue }
        inQuotes = !inQuotes
        continue
      }
      if (ch === ',' && !inQuotes) { cols.push(cur); cur = ''; continue }
      cur += ch
    }
    cols.push(cur)
    if (!headers) headers = cols.map(h => h.trim())
    else {
      const obj = {}
      headers.forEach((h, idx) => { obj[h] = cols[idx] === undefined ? '' : cols[idx].trim() })
      rows.push(obj)
    }
  }
  return rows
}

// Accept CSV path as first argument, otherwise default to the attachment location
const input = process.argv[2] || path.resolve(__dirname, '..', '..', '..', 'Warframe_export.csv')

if (!fs.existsSync(input)) {
  console.error('CSV file not found at', input)
  process.exit(2)
}
const out = path.resolve(__dirname, '..', 'src', 'data', 'warframes.json')

const text = fs.readFileSync(input, 'utf8')
const records = parseCSV(text)

function parseJsonField(val) {
  if (!val) return []
  try {
    return JSON.parse(val)
  } catch (e) {
    try {
      const fixed = val.replace(/""/g, '"')
      return JSON.parse(fixed)
    } catch (e2) {
      console.warn('Failed to parse field:', val)
      return []
    }
  }
}

const outArr = records.map(r => {
  return {
    name: r.name || '',
    type: r.type || '',
    neuroptics_collected: r.neuroptics_collected === 'true',
    chassis_collected: r.chassis_collected === 'true',
    systems_collected: r.systems_collected === 'true',
    blueprint_collected: r.blueprint_collected === 'true',
    is_mastered: false,
    neuroptics_resources: parseJsonField(r.neuroptics_resources),
    chassis_resources: parseJsonField(r.chassis_resources),
    systems_resources: parseJsonField(r.systems_resources),
    blueprint_resources: parseJsonField(r.blueprint_resources)
  }
})

fs.writeFileSync(out, JSON.stringify(outArr, null, 2), 'utf8')
console.log('Wrote', out, 'with', outArr.length, 'entries')
