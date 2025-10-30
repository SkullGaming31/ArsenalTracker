import { ref } from 'vue'
import { defineStore } from 'pinia'
import Fuse from 'fuse.js'
import type { Warframe } from '../types/warframe'
import type { FuseResult } from '../types/search'

export const useSearchStore = defineStore('search', () => {
  const query = ref('')
  // Use a small typed shape for Fuse results to avoid `any` usage
  const results = ref<FuseResult<Warframe>[]>([])
  const fuseRef = ref<Fuse<Warframe> | null>(null)

  function createFuse(list: Warframe[]) {
    fuseRef.value = new Fuse(list, {
      keys: [
        { name: 'name', weight: 0.9 },
        { name: 'type', weight: 0.4 },
        { name: 'description', weight: 0.1 }
      ],
      threshold: 0.35,
      includeMatches: true,
      ignoreLocation: true
    })
  }

  function search(q: string) {
    if (!fuseRef.value) return results.value = []
    const r = String(q || '').trim()
    if (!r) return results.value = []
  const res = fuseRef.value.search(r, { limit: 200 })
  results.value = res.map((resItem) => ({ item: resItem.item, matches: resItem.matches }))
  }

  return {
    query,
    results,
    fuseRef,
    createFuse,
    search
  }
})
