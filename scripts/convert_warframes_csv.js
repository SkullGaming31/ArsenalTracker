const fs = require('fs')
const path = require('path')
const csv = require('csv-parse/lib/sync')

const input = path.resolve(__dirname, '..', '..', 'Warframe_export.csv')
const out = path.resolve(__dirname, '..', 'src', 'data', 'warframes.json')

const text = fs.readFileSync(input, 'utf8')
const records = csv(text, { columns: true, skip_empty_lines: true })

function parseJsonField(val) {
  if (!val) return []
  try {
    // The CSV appears to use doubled quotes inside; attempt JSON parse
    return JSON.parse(val)
  } catch (e) {
    // Try to fix common issues: replace doubled double-quotes
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
