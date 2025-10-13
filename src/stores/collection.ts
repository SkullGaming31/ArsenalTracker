import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import warframesData from '../data/warframes.json'
import weaponsData from '../data/weapons.json'

export const STORAGE_KEY = 'arsenaltracker.v1'
const CURRENT_VERSION = 1

type WarframeOverride = Partial<Record<string, any>>

export const useCollectionStore = defineStore('collection', () => {
  // underlying static data (source-of-truth from project files)
  const warframes = ref<any[]>(warframesData as any[])
  const weapons = ref<any[]>(weaponsData as any[])

  // overrides persisted in localStorage keyed by warframe/weapon name
  const overrides = ref<Record<string, WarframeOverride>>({})

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      // migration path: if stored object has a 'version' key and overrides, use it.
      if (parsed && typeof parsed === 'object') {
        if (parsed.version === CURRENT_VERSION && parsed.overrides) {
          overrides.value = parsed.overrides
        } else {
          // try to migrate legacy shape (where whole payload was overrides object)
          if (!parsed.version && Object.keys(parsed).length > 0) {
            // assume parsed is an overrides map already
            overrides.value = parsed
            // persist upgraded shape
            saveToStorage()
          }
        }
      }
    } catch (e) {
      // ignore parse errors
      // eslint-disable-next-line no-console
      console.error('[collection] failed to load persistence', e)
    }
  }

  function saveToStorage() {
    try {
      const payload = { version: CURRENT_VERSION, overrides: overrides.value }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[collection] failed to save persistence', e)
    }
  }

  // initialize
  loadFromStorage()

  // derived: merged view of static data + overrides
  const mergedWarframes = computed(() => {
    return warframes.value.map(w => {
      const ov = overrides.value[w.name] || {}
      return { ...w, ...ov }
    })
  })

  const mergedWeapons = computed(() => {
    return weapons.value.map(w => {
      const ov = overrides.value[w.name] || {}
      return { ...w, ...ov }
    })
  })

  function setOverride(name: string, partial: WarframeOverride) {
    overrides.value = { ...overrides.value, [name]: { ...(overrides.value[name] || {}), ...partial } }
  }

  function clearOverrides() {
    overrides.value = {}
  }

  function exportState() {
    return JSON.stringify({ version: CURRENT_VERSION, overrides: overrides.value }, null, 2)
  }

  function importState(json: string) {
    try {
      const parsed = JSON.parse(json)
      if (parsed && typeof parsed === 'object') {
        if (parsed.version === CURRENT_VERSION && parsed.overrides && typeof parsed.overrides === 'object') {
          overrides.value = parsed.overrides
          saveToStorage()
          return true
        }
        // accept legacy format where the JSON is already the overrides map
        if (!parsed.version && typeof parsed === 'object') {
          overrides.value = parsed
          saveToStorage()
          return true
        }
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[collection] failed to import state', e)
    }
    return false
  }

  // persist overrides when they change
  watch(overrides, () => {
    saveToStorage()
  }, { deep: true })

  return {
    warframes,
    weapons,
    overrides,
    mergedWarframes,
    mergedWeapons,
    setOverride,
    clearOverrides,
    exportState,
    importState,
  }
})
