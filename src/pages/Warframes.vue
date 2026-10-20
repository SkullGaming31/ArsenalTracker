<template>
  <div class="warframes">
    <div class="toolbar">
      <!-- Search and Hide Completed moved to global header -->
      <div style="display:flex; gap:12px; align-items:center;">
        <div>Show</div>
        <q-select dense outlined emit-value v-model="primeFilter" :options="primeFilterOptions" style="min-width:160px" />
      </div>
    </div>

    <section class="section">
      <div class="pager" style="display:flex; gap:8px; align-items:center; margin-bottom:8px">
        <div style="display:flex; gap:8px; align-items:center;">
          <div>Per page</div>
          <q-select dense outlined emit-value v-model.number="pageSize" :options="pageOptions" style="min-width:120px" />
        </div>
        <q-btn dense flat label="Prev" @click="prev" :disable="current === 0" />
        <div>Page {{ current + 1 }} / {{ totalPages }}</div>
        <q-btn dense flat label="Next" @click="next" :disable="current >= totalPages - 1" />
      </div>
      <!-- virtualized combined list -->
      <div ref="scrollRef" class="virtual-scroll" style="height:70vh; overflow:auto;">
        <div :style="{ height: totalHeight + 'px', position: 'relative' }">
          <!-- center and constrain the inner column so cards don't stretch full page width -->
          <div style="max-width:1200px; margin:0 auto; position:relative;">
            <div v-for="vi in virtualRenderItems" :key="vi.item.name" :style="{ position: 'absolute', top: vi.start + 'px', left: (vi.col * (100/columns)) + '%', width: (100/columns) + '%' }">
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

// Filter for showing prime/non-prime/all
const primeFilter = ref('all') // 'all' | 'prime' | 'non-prime'
const primeFilterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Prime', value: 'prime' },
  { label: 'Non-prime', value: 'non-prime' }
]

const warframesAll = computed<Warframe[]>(() => collection.mergedWarframes as Warframe[])

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
  // completed only when both mastery and all parts are present
  const mastered = flagTrue(w.is_mastered)
  const partsAll = flagTrue(w.neuroptics_collected) && flagTrue(w.chassis_collected) && flagTrue(w.systems_collected) && flagTrue(w.blueprint_collected)
  return mastered && partsAll
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

// Combine prime and non-prime based on filter
const filteredWarframes = computed<Warframe[]>(() => {
  const q = String(query.value || '').trim()
  const names = new Set(search.results.map(r => r.item.name))

  let baseList: Warframe[]
  if (primeFilter.value === 'prime') {
    baseList = primeWarframes.value
  } else if (primeFilter.value === 'non-prime') {
    baseList = nonPrimeWarframes.value
  } else {
    // Combine both: primes first, then non-primes
    baseList = [...primeWarframes.value, ...nonPrimeWarframes.value]
  }

  let list = !q ? baseList : baseList.filter(w => names.has(w.name))
  if (hideCompleted.value) list = list.filter(w => !isCompleted(w))
  return list.slice().sort((a,b) => (a.name||'').localeCompare(b.name||''))
})

// --- Virtualization for combined list (responsive) ---
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

// Combined virtual scroll
const scrollRef = ref<HTMLElement | null>(null)
// pagination
const pageSize = ref(-1)
const pageOptions = [
  { label: '20', value: 20 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
  { label: 'All', value: -1 }
]
const current = ref(0)
const totalPages = computed(() => (pageSize.value < 0 ? 1 : Math.max(1, Math.ceil(filteredWarframes.value.length / pageSize.value))))
const paged = computed(() => {
  if (pageSize.value < 0) return filteredWarframes.value
  const start = current.value * pageSize.value
  return filteredWarframes.value.slice(start, start + pageSize.value)
})

const totalRows = computed(() => Math.ceil(paged.value.length / columns.value))
const visibleRange = ref({ start: 0, end: Math.min(totalRows.value, 10) })
const virtualItems = computed(() => {
  const items: VirtualRow[] = []
  const start = visibleRange.value.start
  const end = visibleRange.value.end
  for (let r = start; r < end; r++) items.push({ row: r, start: r * itemSize.value, size: itemSize.value })
  return items
})
// expand each visible row into up to `columns` render cells with column index
const virtualRenderItems = computed(() => {
  const out: { item: Warframe; start: number; col: number }[] = []
  virtualItems.value.forEach((vr) => {
    for (let c = 0; c < columns.value; c++) {
      const idx = vr.row * columns.value + c
      const item = paged.value[idx]
      if (!item) continue
      out.push({ item, start: vr.start, col: c })
    }
  })
  return out
})
const totalHeight = computed(() => totalRows.value * itemSize.value)

let raf: number | null = null
function recomputeOnce() {
  const el = scrollRef.value
  if (!el) return
  const scrollTop = el.scrollTop
  const clientHeight = el.clientHeight || 600
  const start = Math.floor(scrollTop / itemSize.value) - 5
  const end = Math.ceil((scrollTop + clientHeight) / itemSize.value) + 5
  visibleRange.value.start = Math.max(0, start)
  visibleRange.value.end = Math.min(totalRows.value, end)
}

function recompute() {
  if (raf !== null) return
  raf = requestAnimationFrame(() => {
    try { recomputeOnce() } finally { raf = null }
  })
}

function prev() { if (current.value > 0) current.value-- }
function next() { if (current.value < totalPages.value - 1) current.value++ }

// keep pages valid when underlying list changes
watch([pageSize, filteredWarframes], () => {
  if (current.value >= totalPages.value) current.value = Math.max(0, totalPages.value - 1)
  visibleRange.value = { start: 0, end: Math.min(totalRows.value, 10) }
})

onMounted(() => {
  updateLayoutForWidth(window.innerWidth)
  window.addEventListener('resize', onResize)
  const el = scrollRef.value
  if (el) el.addEventListener('scroll', recompute)
  watch(filteredWarframes, () => recompute())
  setTimeout(recompute, 0)
})

// no-op watcher preserved for reactivity
watch(virtualRenderItems, () => {}, { immediate: true })

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
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

