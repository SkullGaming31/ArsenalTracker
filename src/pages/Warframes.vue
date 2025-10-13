<template>
  <div class="warframes">
    <h2>Warframes</h2>
    <div class="toolbar">
      <input v-model="query" placeholder="Search warframes..." class="search" />
    </div>
    <section class="section">
      <h3>Prime</h3>
      <div class="grid">
  <WarframeCard v-for="w in filteredPrimeWarframes" :key="w.name" :warframe="w" :highlight="query" @update="handleUpdate" />
      </div>
    </section>

    <section class="section">
      <h3>Non-Prime</h3>
      <div class="grid">
  <WarframeCard v-for="w in filteredNonPrimeWarframes" :key="w.name" :warframe="w" :highlight="query" @update="handleUpdate" />
      </div>
    </section>
    
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import WarframeCard from '../components/WarframeCard.vue'
import { useCollectionStore } from '../stores/collection'
import { useSearchStore } from '../stores/search'
import type { Warframe } from '../types/warframe'

const collection = useCollectionStore()
const query = ref<string>('')
const search = useSearchStore()

const warframesAll = computed<Warframe[]>(() => collection.mergedWarframes as Warframe[])

const primeWarframes = computed<Warframe[]>(() =>
  warframesAll.value.filter((w: Warframe) => {
    const t = String(w.type || '').toLowerCase()
    const nonPrimeRegex = /\bnon[-\s]*prime\b|\bnonprime\b/
    if (nonPrimeRegex.test(t)) return false
    return /\bprime\b/.test(t)
  })
)

const nonPrimeWarframes = computed<Warframe[]>(() =>
  warframesAll.value.filter((w: Warframe) => {
    const t = String(w.type || '').toLowerCase()
    const nonPrimeRegex = /\bnon[-\s]*prime\b|\bnonprime\b/
    if (nonPrimeRegex.test(t)) return true
    return !/\bprime\b/.test(t)
  })
)

// create/upate fuse index whenever the base list changes
watch(warframesAll, (val) => {
  search.createFuse(val)
}, { immediate: true })

// debounce query -> call search
let queryTimeout: any = null
watch(query, (q) => {
  if (queryTimeout) clearTimeout(queryTimeout)
  queryTimeout = setTimeout(() => {
    search.query = q
    search.search(q)
  }, 200)
})

const filteredPrimeWarframes = computed<Warframe[]>(() => {
  const q = String(query.value || '').trim()
  if (!q) return primeWarframes.value
  // use fuse results and filter to prime subset
  const names = new Set(search.results.map((r: any) => r.item.name))
  return primeWarframes.value.filter(w => names.has(w.name))
})

const filteredNonPrimeWarframes = computed<Warframe[]>(() => {
  const q = String(query.value || '').trim()
  if (!q) return nonPrimeWarframes.value
  const names = new Set(search.results.map((r: any) => r.item.name))
  return nonPrimeWarframes.value.filter(w => names.has(w.name))
})

function handleUpdate(payload: any) {
  if (!payload || !payload.name) return
  collection.setOverride(payload.name, payload)
}
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.section {
  margin-bottom: 20px;
}

.section h3 {
  margin: 8px 0;
}
/* center the page content */
.warframes {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px;
}
</style>
