import { describe, it, expect } from 'vitest'
import { parseImportFile, mapRowsToOverrides, exportOverridesToCSV, type ImportOverride } from '../lib/importer'

describe('importer', () => {
  it('parses simple CSV and maps to overrides', () => {
    const csv = 'Name,Neuroptics,Chassis,Blueprint\nExcalibur Prime,1,0,1\nLoki Prime,0,1,0'
    const parsed = parseImportFile(csv)
    expect(parsed.type).toBe('csv')
    if (parsed.type === 'csv') {
      const overrides = mapRowsToOverrides(parsed.rows)
      expect(overrides['Excalibur Prime']).toBeTruthy()
      const ex = overrides['Excalibur Prime']!
      expect(ex.neuroptics_collected).toBe(true)
      const lok = overrides['Loki Prime']!
      expect(lok.chassis_collected).toBe(true)
    }
  })

  it('parses JSON array and returns rows', () => {
    const json = JSON.stringify([{ name: 'Rhino', neuro: '1' }])
    const parsed = parseImportFile(json)
    expect(parsed.type).toBe('json')
    if (parsed.type === 'json') {
      const overrides = mapRowsToOverrides(parsed.rows)
      expect(overrides['Rhino']).toBeTruthy()
    }
  })

  it('exports overrides to CSV', () => {
    const overrides = {
      'Excalibur Prime': { neuroptics_collected: true, is_mastered: false },
      'Lato Prime': { is_mastered: true }
    }
  const csv = exportOverridesToCSV(overrides as unknown as Record<string, ImportOverride>)
    expect(csv).toContain('Excalibur Prime')
    expect(csv).toContain('Lato Prime')
  })
})
