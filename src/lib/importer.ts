// Minimal CSV/JSON parser and mapping utilities for Warframe export imports
export type ParsedRow = Record<string, string>

function parseCSV(text: string): ParsedRow[] {
  const rows: ParsedRow[] = []
  // naive but robust CSV parser supporting quoted fields
  const lines = text.split(/\r?\n/).filter(l => l && l.trim().length > 0)
  if (lines.length === 0) return rows
  const headers = splitCSVLine(lines[0])
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue
    const cols = splitCSVLine(line)
    const row: ParsedRow = {}
    for (let j = 0; j < headers.length; j++) {
      const key = (headers[j] || '').trim()
      row[key] = cols[j] !== undefined && cols[j] !== null ? String(cols[j]) : ''
    }
    rows.push(row)
  }
  return rows
}

function splitCSVLine(line: string | undefined) {
  if (!line) return []
  const cols: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i+1] === '"') { cur += '"'; i++ } else { inQuotes = !inQuotes }
      continue
    }
    if (ch === ',' && !inQuotes) { cols.push(cur); cur = ''; continue }
    cur += ch
  }
  cols.push(cur)
  return cols
}

function parseJSON(text: string) {
  try { return JSON.parse(text) } catch { return null }
}

function normalizeBool(val: string): boolean {
  if (val === undefined || val === null) return false
  const s = String(val).trim().toLowerCase()
  return ['1','true','yes','y','x'].includes(s)
}

// Map parsed rows to overrides by name. Best-effort mapping using header keywords.
export function mapRowsToOverrides(rows: ParsedRow[]) {
  const overrides: Record<string, any> = {}
  if (!rows || rows.length === 0) return overrides
  const headers = rows[0] ? Object.keys(rows[0]) : []
  // find name column
  const nameKey = headers.find(h => /name|warframe/i.test(h)) || headers[0]
  const neuroKey = headers.find(h => /neuro|neuroptics/i.test(h))
  const chassisKey = headers.find(h => /chassis/i.test(h))
  const systemsKey = headers.find(h => /system/i.test(h))
  const blueprintKey = headers.find(h => /blueprint/i.test(h))
  const masteredKey = headers.find(h => /master|mastered/i.test(h))

  for (const r of rows) {
  const nameRaw = nameKey ? r[nameKey] : undefined
  const name = (nameRaw || '').trim()
    if (!name) continue
    const entry: any = {}
  if (neuroKey && r[neuroKey] !== undefined) entry.neuroptics_collected = normalizeBool(String(r[neuroKey]))
  if (chassisKey && r[chassisKey] !== undefined) entry.chassis_collected = normalizeBool(String(r[chassisKey]))
  if (systemsKey && r[systemsKey] !== undefined) entry.systems_collected = normalizeBool(String(r[systemsKey]))
  if (blueprintKey && r[blueprintKey] !== undefined) entry.blueprint_collected = normalizeBool(String(r[blueprintKey]))
  if (masteredKey && r[masteredKey] !== undefined) entry.is_mastered = normalizeBool(String(r[masteredKey]))
    // try parse resources JSON if provided in resource-like columns
    headers.forEach(h => {
      if (/resources/i.test(h) && r[h]) {
        try {
          const parsed = JSON.parse(r[h])
          // attach to a reasonable property name if it matches
          if (Array.isArray(parsed)) {
            const key = h.toLowerCase().includes('neuro') ? 'neuroptics_resources' : h.toLowerCase().includes('chassis') ? 'chassis_resources' : h.toLowerCase().includes('system') ? 'systems_resources' : h.toLowerCase().includes('blueprint') ? 'blueprint_resources' : null
            if (key) entry[key] = parsed
          }
        } catch (e) {
          // ignore JSON parse errors
        }
      }
    })
    overrides[name] = entry
  }
  return overrides
}

// Accept raw text (CSV or JSON). Returns { type: 'csv'|'json'|'versioned', rows?, payload? }
export function parseImportFile(text: string) {
  const maybeJson = parseJSON(text)
  if (maybeJson) {
    // If this is a versioned payload with overrides, return directly
    if (maybeJson.version && maybeJson.overrides) return { type: 'versioned', payload: maybeJson }
    // if it's an array of items (warframe export), map to rows
    if (Array.isArray(maybeJson)) return { type: 'json', rows: maybeJson.map((o: any) => o) }
    // else unknown object shape
    return { type: 'json', rows: [maybeJson] }
  }
  // try CSV
  const rows = parseCSV(text)
  if (rows && rows.length > 0) return { type: 'csv', rows }
  return { type: 'unknown' }
}

// Export overrides map to CSV string (simple flatten: name + fields)
export function exportOverridesToCSV(overrides: Record<string, any>) {
  const rows = [] as string[]
  const headers = new Set<string>()
  Object.values(overrides).forEach(o => Object.keys(o || {}).forEach(k => headers.add(k)))
  const headerList = ['name', ...Array.from(headers)]
  rows.push(headerList.join(','))
  for (const name of Object.keys(overrides)) {
    const o = overrides[name]
    const vals = headerList.map(h => {
      if (h === 'name') return quoteCSV(name)
      const v = o[h]
      if (v === undefined) return ''
      if (typeof v === 'object') return quoteCSV(JSON.stringify(v))
      return quoteCSV(String(v))
    })
    rows.push(vals.join(','))
  }
  return rows.join('\n')
}

function quoteCSV(s: string) {
  if (s.includes(',') || s.includes('\n') || s.includes('"')) return '"' + s.replace(/"/g,'""') + '"'
  return s
}

export { parseCSV }
