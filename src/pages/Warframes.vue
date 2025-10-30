<template>
  <div class="warframes">
    <div class="toolbar">
      <!-- Search and Hide Completed moved to global header -->
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
// give component a multi-word name to satisfy eslint vue/multi-word-component-names
defineOptions({ name: 'WarframesPage' })
import { computed, watch } from 'vue'
import WarframeCard from '../components/WarframeCard.vue'
import { useCollectionStore } from '../stores/collection'
import { useSearchStore } from '../stores/search'
import type { Warframe } from '../types/warframe'

const collection = useCollectionStore()
const props = defineProps<{ query?: string; hideCompleted?: boolean }>()
const query = computed(() => props.query ?? '')
const hideCompleted = computed(() => Boolean(props.hideCompleted))
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

// helper to coerce flags
const flagTrue = (v: unknown): boolean => {
  if (v === true) return true
  if (v === false) return false
  if (typeof v === 'string') return v.toLowerCase() === 'true'
  if (typeof v === 'number') return v !== 0
  return Boolean(v)
}

const isCompleted = (w: Warframe) => {
  // mastered OR all parts collected
  const mastered = flagTrue(w.is_mastered)
  const partsAll = flagTrue(w.neuroptics_collected) && flagTrue(w.chassis_collected) && flagTrue(w.systems_collected) && flagTrue(w.blueprint_collected)
  return mastered || partsAll
}

// create/upate fuse index whenever the base list changes
watch(warframesAll, (val) => {
  search.createFuse(val)
}, { immediate: true })

// debounce query -> call search
let queryTimeout: ReturnType<typeof setTimeout> | null = null
watch(() => query.value, (q) => {
  if (queryTimeout) clearTimeout(queryTimeout)
  queryTimeout = setTimeout(() => {
    search.query = q
    search.search(q)
  }, 200)
})

const filteredPrimeWarframes = computed<Warframe[]>(() => {
  const q = String(query.value || '').trim()
  const names = new Set(search.results.map(r => r.item.name))
  let list = !q ? primeWarframes.value : primeWarframes.value.filter(w => names.has(w.name))
  if (hideCompleted.value) list = list.filter(w => !isCompleted(w))
  return list.slice().sort((a,b) => (a.name||'').localeCompare(b.name||''))
})

const filteredNonPrimeWarframes = computed<Warframe[]>(() => {
  const q = String(query.value || '').trim()
  const names = new Set(search.results.map(r => r.item.name))
  let list = !q ? nonPrimeWarframes.value : nonPrimeWarframes.value.filter(w => names.has(w.name))
  if (hideCompleted.value) list = list.filter(w => !isCompleted(w))
  return list.slice().sort((a,b) => (a.name||'').localeCompare(b.name||''))
})

interface WFUpdatePayload {
  name: string
  neuroptics_collected?: boolean
  chassis_collected?: boolean
  systems_collected?: boolean
  blueprint_collected?: boolean
  is_mastered?: boolean
}

function handleUpdate(payload: unknown) {
  if (typeof payload !== 'object' || payload === null) return
  const p = payload as Partial<WFUpdatePayload>
  if (!p.name) return
  // collection.setOverride expects a Partial<Record<string, unknown>>; cast the payload
  // so TypeScript is satisfied while preserving the typed shape locally.
  collection.setOverride(p.name, p as Partial<Record<string, unknown>>)
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

/* toggle switch (shared) */
.toggle { cursor: pointer; display: inline-flex; align-items: center; gap:8px }
.toggle input { position: absolute; opacity: 0; width: 0; height: 0 }
.toggle .slider { width:40px; height:22px; background: #fff; border-radius: 999px; position: relative; transition: background .12s ease }
.toggle .slider::after { content: ''; position: absolute; left: 3px; top: 3px; width:16px; height:16px; background: var(--toggle-knob, #0b0c0d); border-radius:50%; transition: transform .12s ease }
.toggle input:checked + .slider { background: var(--accent-green, #2bb673) }
.toggle input:checked + .slider::after { transform: translateX(18px); background: #fff }
.toggle .toggle-label { color: var(--muted); font-size:0.95rem }
</style>

