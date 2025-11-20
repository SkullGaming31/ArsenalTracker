<template>
  <div class="warframes">
    <div class="toolbar">
      <!-- Search and Hide Completed moved to global header -->
    </div>
      <!-- dev debug panel removed -->
    <section class="section">
      <h3>Prime</h3>
      <div class="pager" style="display:flex; gap:8px; align-items:center; margin-bottom:8px">
        <div style="display:flex; gap:8px; align-items:center;">
          <div>Per page</div>
          <q-select dense outlined emit-value v-model.number="primePageSize" :options="primePageOptions" style="min-width:120px" />
        </div>
        <q-btn dense flat label="Prev" @click="primePrev" :disable="primeCurrent === 0" />
        <div>Page {{ primeCurrent + 1 }} / {{ primeTotalPages }}</div>
        <q-btn dense flat label="Next" @click="primeNext" :disable="primeCurrent >= primeTotalPages - 1" />
      </div>
      <!-- virtualized prime list -->
  <div ref="primeScrollRef" class="virtual-scroll" style="height:60vh; overflow:auto;">
        <div :style="{ height: primeTotalHeight + 'px', position: 'relative' }">
          <!-- center and constrain the inner column so cards don't stretch full page width -->
          <div style="max-width:1200px; margin:0 auto; position:relative;">
            <div v-for="vi in primeVirtualRenderItems" :key="vi.item.name" :style="{ position: 'absolute', top: vi.start + 'px', left: (vi.col * (100/columns)) + '%', width: (100/columns) + '%' }">
              <div style="padding:8px; display:flex; justify-content:center;">
                <div class="card-wrap">
                  <WarframeCard :warframe="vi.item" :highlight="query" @update="handleUpdate" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <h3>Non-Prime</h3>
      <div class="pager" style="display:flex; gap:8px; align-items:center; margin-bottom:8px">
        <div style="display:flex; gap:8px; align-items:center;">
          <div>Per page</div>
          <q-select dense outlined emit-value v-model.number="nonPrimePageSize" :options="primePageOptions" style="min-width:120px" />
        </div>
        <q-btn dense flat label="Prev" @click="nonPrimePrev" :disable="nonPrimeCurrent === 0" />
        <div>Page {{ nonPrimeCurrent + 1 }} / {{ nonPrimeTotalPages }}</div>
        <q-btn dense flat label="Next" @click="nonPrimeNext" :disable="nonPrimeCurrent >= nonPrimeTotalPages - 1" />
      </div>
      <!-- virtualized non-prime list -->
  <div ref="nonPrimeScrollRef" class="virtual-scroll" style="height:60vh; overflow:auto;">
        <div :style="{ height: nonPrimeTotalHeight + 'px', position: 'relative' }">
          <!-- center and constrain the inner column so cards don't stretch full page width -->
          <div style="max-width:1200px; margin:0 auto; position:relative;">
            <div v-for="vi in nonPrimeVirtualRenderItems" :key="vi.item.name" :style="{ position: 'absolute', top: vi.start + 'px', left: (vi.col * (100/columns)) + '%', width: (100/columns) + '%' }">
              <div style="padding:8px; display:flex; justify-content:center;">
                <div class="card-wrap">
                  <WarframeCard :warframe="vi.item" :highlight="query" @update="handleUpdate" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
  </div>
</template>

<script setup lang="ts">
// give component a multi-word name to satisfy eslint vue/multi-word-component-names
defineOptions({ name: 'WarframesPage' })
import { computed, watch, ref, onMounted, onBeforeUnmount } from 'vue'
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

// debug: log base list to confirm collection provides data
// removed debug logging of full warframes list
// keep a no-op watcher so any necessary reactivity runs but avoid logging
watch(warframesAll, () => {}, { immediate: true })

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

// --- Virtualization for prime and non-prime lists (responsive) ---
// itemSize is the assumed height (px) for each rendered row. We make this
// responsive so cards fit better on narrow screens.
type VirtualRow = { row: number; start: number; size: number }
const itemSize = ref(460)
// responsive columns: 1 (mobile), 2 (tablet), 4 (desktop)
const columns = ref(4)

function updateLayoutForWidth(w: number) {
  if (w <= 640) {
    columns.value = 1
    itemSize.value = 380
  } else if (w <= 900) {
    columns.value = 2
    itemSize.value = 420
  } else {
    columns.value = 4
    itemSize.value = 460
  }
}

function onResize() {
  updateLayoutForWidth(window.innerWidth)
}

// Prime
const primeScrollRef = ref<HTMLElement | null>(null)
// pagination for quick mitigation
// pageSize < 0 means show all items (no pagination)
const primePageSize = ref(-1)
const primePageOptions = [
  { label: '20', value: 20 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
  { label: 'All', value: -1 }
]
const primeCurrent = ref(0)
const primeTotalPages = computed(() => (primePageSize.value < 0 ? 1 : Math.max(1, Math.ceil(filteredPrimeWarframes.value.length / primePageSize.value))))
const pagedPrime = computed(() => {
  if (primePageSize.value < 0) return filteredPrimeWarframes.value
  const start = primeCurrent.value * primePageSize.value
  return filteredPrimeWarframes.value.slice(start, start + primePageSize.value)
})

const primeTotalRows = computed(() => Math.ceil(pagedPrime.value.length / columns.value))
const primeVisibleRange = ref({ start: 0, end: Math.min(primeTotalRows.value, 10) })
const primeVirtualItems = computed(() => {
  const items: VirtualRow[] = []
  const start = primeVisibleRange.value.start
  const end = primeVisibleRange.value.end
  for (let r = start; r < end; r++) items.push({ row: r, start: r * itemSize.value, size: itemSize.value })
  return items
})
// expand each visible row into up to `columns` render cells with column index
const primeVirtualRenderItems = computed(() => {
  const out: { item: Warframe; start: number; col: number }[] = []
  primeVirtualItems.value.forEach((vr) => {
    for (let c = 0; c < columns.value; c++) {
      const idx = vr.row * columns.value + c
      const item = pagedPrime.value[idx]
      if (!item) continue
      out.push({ item, start: vr.start, col: c })
    }
  })
  return out
})
const primeTotalHeight = computed(() => primeTotalRows.value * itemSize.value)

let rafPrime: number | null = null
function recomputePrimeOnce() {
  const el = primeScrollRef.value
  if (!el) return
  const scrollTop = el.scrollTop
  const clientHeight = el.clientHeight || 600
  const start = Math.floor(scrollTop / itemSize.value) - 5
  const end = Math.ceil((scrollTop + clientHeight) / itemSize.value) + 5
  primeVisibleRange.value.start = Math.max(0, start)
  primeVisibleRange.value.end = Math.min(primeTotalRows.value, end)
}

function recomputePrime() {
  if (rafPrime !== null) return
  rafPrime = requestAnimationFrame(() => {
    try { recomputePrimeOnce() } finally { rafPrime = null }
  })
}

onMounted(() => {
  updateLayoutForWidth(window.innerWidth)
  window.addEventListener('resize', onResize)
  const el = primeScrollRef.value
  if (el) el.addEventListener('scroll', recomputePrime)
  watch(filteredPrimeWarframes, () => recomputePrime())
  setTimeout(recomputePrime, 0)
})

// debug: log virtual items to help trace missing data
// removed debug logging of virtual render items
// no-op watcher preserved for reactivity
watch(primeVirtualRenderItems, () => {}, { immediate: true })

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
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

const nonPrimeTotalRows = computed(() => Math.ceil(pagedNonPrime.value.length / columns.value))
const nonPrimeVisibleRange = ref({ start: 0, end: Math.min(nonPrimeTotalRows.value, 10) })
const nonPrimeVirtualItems = computed(() => {
  const items: VirtualRow[] = []
  const start = nonPrimeVisibleRange.value.start
  const end = nonPrimeVisibleRange.value.end
  for (let r = start; r < end; r++) items.push({ row: r, start: r * itemSize.value, size: itemSize.value })
  return items
})
const nonPrimeVirtualRenderItems = computed(() => {
  const out: { item: Warframe; start: number; col: number }[] = []
  nonPrimeVirtualItems.value.forEach((vr) => {
    for (let c = 0; c < columns.value; c++) {
      const idx = vr.row * columns.value + c
      const item = pagedNonPrime.value[idx]
      if (!item) continue
      out.push({ item, start: vr.start, col: c })
    }
  })
  return out
})
const nonPrimeTotalHeight = computed(() => nonPrimeTotalRows.value * itemSize.value)

let rafNonPrime: number | null = null
function recomputeNonPrimeOnce() {
  const el = nonPrimeScrollRef.value
  if (!el) return
  const scrollTop = el.scrollTop
  const clientHeight = el.clientHeight || 600
  const start = Math.floor(scrollTop / itemSize.value) - 5
  const end = Math.ceil((scrollTop + clientHeight) / itemSize.value) + 5
  nonPrimeVisibleRange.value.start = Math.max(0, start)
  nonPrimeVisibleRange.value.end = Math.min(nonPrimeTotalRows.value, end)
}

function recomputeNonPrime() {
  if (rafNonPrime !== null) return
  rafNonPrime = requestAnimationFrame(() => {
    try { recomputeNonPrimeOnce() } finally { rafNonPrime = null }
  })
}

function primePrev() { if (primeCurrent.value > 0) primeCurrent.value-- }
function primeNext() { if (primeCurrent.value < primeTotalPages.value - 1) primeCurrent.value++ }
function nonPrimePrev() { if (nonPrimeCurrent.value > 0) nonPrimeCurrent.value-- }
function nonPrimeNext() { if (nonPrimeCurrent.value < nonPrimeTotalPages.value - 1) nonPrimeCurrent.value++ }

// keep pages valid when underlying list changes
watch([primePageSize, filteredPrimeWarframes], () => {
  if (primeCurrent.value >= primeTotalPages.value) primeCurrent.value = Math.max(0, primeTotalPages.value - 1)
  primeVisibleRange.value = { start: 0, end: Math.min(primeTotalRows.value, 10) }
})
watch([nonPrimePageSize, filteredNonPrimeWarframes], () => {
  if (nonPrimeCurrent.value >= nonPrimeTotalPages.value) nonPrimeCurrent.value = Math.max(0, nonPrimeTotalPages.value - 1)
  nonPrimeVisibleRange.value = { start: 0, end: Math.min(nonPrimeTotalRows.value, 10) }
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
  // but first avoid mutating the store if the incoming partial matches the existing override
  // to prevent reactive churn that can cause recursive update loops in production.
  try {
    const name = p.name
    const existing = collection.overrides && (collection.overrides as Record<string, unknown>)[name]
    // Compare via JSON when possible; if stringify fails, fall back to always writing
    if (existing !== undefined) {
      try {
        const existingJson = JSON.stringify(existing)
        const incomingJson = JSON.stringify(p)
        if (existingJson === incomingJson) {
          // no-op: nothing changed
          return
        }
      } catch {
        // ignore stringify errors and proceed to set override
      }
    }
  } catch {
    // defensive: fall through and set override
  }

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
.card-wrap { width:100%; max-width:300px; padding-bottom:12px }
@media (max-width: 640px) {
  .card-wrap { max-width: 92% }
}

/* touch-friendly virtual scroller */
.virtual-scroll { -webkit-overflow-scrolling: touch; touch-action: pan-y }
</style>

