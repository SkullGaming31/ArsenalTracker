<template>
  <div class="warframes">
    <div class="toolbar">
      <!-- Search and Hide Completed moved to global header -->
    </div>
    <section class="section">
      <h3>Prime</h3>
      <div class="pager" style="display:flex; gap:8px; align-items:center; margin-bottom:8px">
        <label>
          Per page
          <select v-model.number="primePageSize">
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </label>
        <button @click="primePrev" :disabled="primeCurrent === 0">Prev</button>
        <div>Page {{ primeCurrent + 1 }} / {{ primeTotalPages }}</div>
        <button @click="primeNext" :disabled="primeCurrent >= primeTotalPages - 1">Next</button>
      </div>
      <!-- virtualized prime list -->
      <div ref="primeScrollRef" style="height:60vh; overflow:auto;">
        <div :style="{ height: primeTotalHeight + 'px', position: 'relative' }">
          <div v-for="vi in primeVirtualRenderItems" :key="vi.item.name" :style="{ position: 'absolute', top: vi.start + 'px', left: 0, right: 0 }">
            <WarframeCard :warframe="vi.item" :highlight="query" @update="handleUpdate" />
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <h3>Non-Prime</h3>
      <div class="pager" style="display:flex; gap:8px; align-items:center; margin-bottom:8px">
        <label>
          Per page
          <select v-model.number="nonPrimePageSize">
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </label>
        <button @click="nonPrimePrev" :disabled="nonPrimeCurrent === 0">Prev</button>
        <div>Page {{ nonPrimeCurrent + 1 }} / {{ nonPrimeTotalPages }}</div>
        <button @click="nonPrimeNext" :disabled="nonPrimeCurrent >= nonPrimeTotalPages - 1">Next</button>
      </div>
      <!-- virtualized non-prime list -->
      <div ref="nonPrimeScrollRef" style="height:60vh; overflow:auto;">
        <div :style="{ height: nonPrimeTotalHeight + 'px', position: 'relative' }">
          <div v-for="vi in nonPrimeVirtualRenderItems" :key="vi.item.name" :style="{ position: 'absolute', top: vi.start + 'px', left: 0, right: 0 }">
            <WarframeCard :warframe="vi.item" :highlight="query" @update="handleUpdate" />
          </div>
        </div>
      </div>
    </section>
    
  </div>
</template>

<script setup lang="ts">
// give component a multi-word name to satisfy eslint vue/multi-word-component-names
defineOptions({ name: 'WarframesPage' })
import { computed, watch, ref, onMounted } from 'vue'
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

// --- Virtualization for prime and non-prime lists ---
type VirtualItem = { index: number; start: number; size: number }
const itemSize = 220

// Prime
const primeScrollRef = ref<HTMLElement | null>(null)
// pagination for quick mitigation
// pageSize < 0 means show all items (no pagination)
const primePageSize = ref(-1)
const primeCurrent = ref(0)
const primeTotalPages = computed(() => (primePageSize.value < 0 ? 1 : Math.max(1, Math.ceil(filteredPrimeWarframes.value.length / primePageSize.value))))
const pagedPrime = computed(() => {
  if (primePageSize.value < 0) return filteredPrimeWarframes.value
  const start = primeCurrent.value * primePageSize.value
  return filteredPrimeWarframes.value.slice(start, start + primePageSize.value)
})

const primeVisibleRange = ref({ start: 0, end: Math.min(pagedPrime.value.length, 10) })
const primeVirtualItems = computed(() => {
  const items: VirtualItem[] = []
  const start = primeVisibleRange.value.start
  const end = primeVisibleRange.value.end
  for (let i = start; i < end; i++) items.push({ index: i, start: i * itemSize, size: itemSize })
  return items
})
const primeVirtualRenderItems = computed(() => {
  return primeVirtualItems.value
    .map(vi => {
      const item = pagedPrime.value[vi.index]
      if (!item) return null
      return { item, start: vi.start }
    })
    .filter(Boolean) as { item: Warframe; start: number }[]
})
const primeTotalHeight = computed(() => pagedPrime.value.length * itemSize)

function recomputePrime() {
  const el = primeScrollRef.value
  if (!el) return
  const scrollTop = el.scrollTop
  const clientHeight = el.clientHeight || 600
  const start = Math.floor(scrollTop / itemSize) - 5
  const end = Math.ceil((scrollTop + clientHeight) / itemSize) + 5
  primeVisibleRange.value.start = Math.max(0, start)
  primeVisibleRange.value.end = Math.min(pagedPrime.value.length, end)
}

onMounted(() => {
  const el = primeScrollRef.value
  if (el) el.addEventListener('scroll', recomputePrime)
  watch(filteredPrimeWarframes, () => recomputePrime())
  setTimeout(recomputePrime, 0)
})

// Non-prime
const nonPrimeScrollRef = ref<HTMLElement | null>(null)
// pagination for non-prime
const nonPrimePageSize = ref(-1)
const nonPrimeCurrent = ref(0)
const nonPrimeTotalPages = computed(() => (nonPrimePageSize.value < 0 ? 1 : Math.max(1, Math.ceil(filteredNonPrimeWarframes.value.length / nonPrimePageSize.value))))
const pagedNonPrime = computed(() => {
  if (nonPrimePageSize.value < 0) return filteredNonPrimeWarframes.value
  const start = nonPrimeCurrent.value * nonPrimePageSize.value
  return filteredNonPrimeWarframes.value.slice(start, start + nonPrimePageSize.value)
})

const nonPrimeVisibleRange = ref({ start: 0, end: Math.min(pagedNonPrime.value.length, 10) })
const nonPrimeVirtualItems = computed(() => {
  const items: VirtualItem[] = []
  const start = nonPrimeVisibleRange.value.start
  const end = nonPrimeVisibleRange.value.end
  for (let i = start; i < end; i++) items.push({ index: i, start: i * itemSize, size: itemSize })
  return items
})
const nonPrimeVirtualRenderItems = computed(() => {
  return nonPrimeVirtualItems.value
    .map(vi => {
      const item = pagedNonPrime.value[vi.index]
      if (!item) return null
      return { item, start: vi.start }
    })
    .filter(Boolean) as { item: Warframe; start: number }[]
})
const nonPrimeTotalHeight = computed(() => pagedNonPrime.value.length * itemSize)

function recomputeNonPrime() {
  const el = nonPrimeScrollRef.value
  if (!el) return
  const scrollTop = el.scrollTop
  const clientHeight = el.clientHeight || 600
  const start = Math.floor(scrollTop / itemSize) - 5
  const end = Math.ceil((scrollTop + clientHeight) / itemSize) + 5
  nonPrimeVisibleRange.value.start = Math.max(0, start)
  nonPrimeVisibleRange.value.end = Math.min(pagedNonPrime.value.length, end)
}

function primePrev() { if (primeCurrent.value > 0) primeCurrent.value-- }
function primeNext() { if (primeCurrent.value < primeTotalPages.value - 1) primeCurrent.value++ }
function nonPrimePrev() { if (nonPrimeCurrent.value > 0) nonPrimeCurrent.value-- }
function nonPrimeNext() { if (nonPrimeCurrent.value < nonPrimeTotalPages.value - 1) nonPrimeCurrent.value++ }

// keep pages valid when underlying list changes
watch([primePageSize, filteredPrimeWarframes], () => {
  if (primeCurrent.value >= primeTotalPages.value) primeCurrent.value = Math.max(0, primeTotalPages.value - 1)
  primeVisibleRange.value = { start: 0, end: Math.min(pagedPrime.value.length, 10) }
})
watch([nonPrimePageSize, filteredNonPrimeWarframes], () => {
  if (nonPrimeCurrent.value >= nonPrimeTotalPages.value) nonPrimeCurrent.value = Math.max(0, nonPrimeTotalPages.value - 1)
  nonPrimeVisibleRange.value = { start: 0, end: Math.min(pagedNonPrime.value.length, 10) }
})

onMounted(() => {
  const el = nonPrimeScrollRef.value
  if (el) el.addEventListener('scroll', recomputeNonPrime)
  watch(filteredNonPrimeWarframes, () => recomputeNonPrime())
  setTimeout(recomputeNonPrime, 0)
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

