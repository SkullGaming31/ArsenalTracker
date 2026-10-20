<template>
  <div class="weapons-page">
    <h2>Weapons</h2>
    <div class="counts">Total weapons: {{ displayedTotal }}</div>

    <div class="toolbar">
      <div style="display:flex; gap:8px; align-items:center">
        <div>Type</div>
        <q-select dense outlined v-model="selectedType" :options="typeOptions" style="min-width:160px" emit-value map-options />
      </div>

      <div style="display:flex; gap:8px; align-items:center">
        <div>Category</div>
        <q-select dense outlined v-model="selectedCategory" :options="categoryOptions" style="min-width:160px" emit-value />
      </div>

      <div style="display:flex; gap:8px; align-items:center">
        <div>Crafted</div>
        <q-select dense outlined v-model="craftedFilter" :options="craftedOptions" style="min-width:160px" emit-value />
      </div>

      <div class="results">Showing {{ filtered.length }} results</div>
    </div>

    <section>
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
                  <WeaponCard :weapon="vi.item" @update="handleUpdate" />
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
defineOptions({ name: 'WeaponsPage' })
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import WeaponCard from '../components/WeaponCard.vue'
import { useCollectionStore } from '../stores/collection'
import type { Weapon, Part, PartWithCollected } from '../types/weapon'

const collection = useCollectionStore()
const all = computed<Weapon[]>(() => collection.mergedWeapons as Weapon[])

const props = defineProps<{ query?: string; hideCompleted?: boolean }>()
const query = computed(() => props.query ?? '')
const hideCompleted = computed(() => Boolean(props.hideCompleted))
const selectedType = ref('all')
const selectedCategory = ref('all')
const craftedFilter = ref('all') // all | crafted | not-crafted

// QSelect option arrays
const typeOptions = computed(() => {
  return [
    { label: 'All', value: 'all' },
    ...types.value.map(t => ({ label: String(t), value: t, disable: !(typeCount(t) > 0) }))
  ]
})

const categoryOptions = [
  { label: 'All', value: 'all' },
  { label: 'Primary', value: 'primary' },
  { label: 'Secondary', value: 'secondary' },
  { label: 'Melee', value: 'melee' }
]

const craftedOptions = [
  { label: 'All', value: 'all' },
  { label: 'Crafted', value: 'crafted' },
  { label: 'Not crafted', value: 'not-crafted' }
]

// canonical type order provided by game taxonomy
const typeOrder: string[] = ['standard', 'prime', 'kuva', 'coda', 'tenet', 'prisma', 'vandal', 'wraith', 'dex', 'nightwatch']

const types = computed(() => {
  // include the full canonical list first, then any extra types from data
  const set = new Set(all.value.map(w => w.type || 'standard'))
  const extras = Array.from(set).filter(t => !typeOrder.includes(t))
  extras.sort()
  return [...typeOrder, ...extras]
})

// counts of weapons per type (used to grey-out empty types)
const typeCounts = computed<Record<string, number>>(() => {
  const counts: Record<string, number> = {}
  all.value.forEach(w => {
    const t = w.type || 'standard'
    counts[t] = (counts[t] || 0) + 1
  })
  return counts
})

// safe accessor for template to avoid "possibly undefined" when indexing
const typeCount = (t: string): number => {
  return typeCounts.value[t] ?? 0
}

const displayedTotal = computed(() => {
  if (!selectedType.value || selectedType.value === 'all') return all.value.length
  return typeCount(selectedType.value)
})

const flagTrue = (v: unknown): boolean => {
  if (v === true) return true
  if (v === false) return false
  if (typeof v === 'string') return v.toLowerCase() === 'true'
  if (typeof v === 'number') return v !== 0
  return Boolean(v)
}

// Determine whether a weapon should be considered "crafted" based on parts
function isCrafted(w: Weapon): boolean {
  const partsArr = (w.parts || []) as Part[]
  // If there are no parts, fall back to explicit flag
  if (!partsArr || partsArr.length === 0) return Boolean(w.is_crafted)

  // Collect persisted override names (parts_collected or collected_parts)
  const rawCollected = w.parts_collected ?? w.collected_parts
  const collectedOverride: string[] = Array.isArray(rawCollected) ? rawCollected : []
  const collectedSet = new Set(collectedOverride)

  // A part is considered collected if either the part object has `collected: true`
  // or its name appears in the persisted override list.
  const allCollected = partsArr.every(p => {
    const name = typeof p === 'string' ? p : p.name
    const byPart = Boolean(((p as PartWithCollected) && (p as PartWithCollected).collected))
    const byOverride = collectedSet.has(name)
    return byPart || byOverride
  })

  if (allCollected) return true
  return Boolean(w.is_crafted)
}

// determine whether all parts are collected for completion semantics
function allPartsCollected(w: Weapon) {
  const partsArr = (w.parts || []) as Part[]
  if (!partsArr || partsArr.length === 0) return true

  const rawCollected = w.parts_collected ?? w.collected_parts
  const collectedOverride: string[] = Array.isArray(rawCollected) ? rawCollected : []
  const collectedSet = new Set(collectedOverride)

  return partsArr.every(p => {
    const name = typeof p === 'string' ? p : (p as Part).name
    const byPart = Boolean(((p as PartWithCollected) && (p as PartWithCollected).collected))
    const byOverride = collectedSet.has(name)
    return byPart || byOverride
  })
}

const isCompleted = (w: Weapon) => {
  // completed only when both mastered and all parts collected
  return flagTrue(w.is_mastered) && allPartsCollected(w)
}

const hasCategory = (w: Weapon, cat: string) => {
  const c = (w && (w as unknown as { category?: string | string[] }).category) as string | string[] | undefined
  if (Array.isArray(c)) return c.includes(cat)
  return String(c || '') === cat
}

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  let list = all.value.filter(w => {
    if (selectedType.value !== 'all' && (w.type || 'standard') !== selectedType.value) return false
    if (selectedCategory.value !== 'all' && !hasCategory(w, selectedCategory.value)) return false
    if (craftedFilter.value !== 'all') {
      const wantsCrafted = craftedFilter.value === 'crafted'
      if (isCrafted(w) !== wantsCrafted) return false
    }
    if (!q) return true
    return w.name.toLowerCase().includes(q)
  })
  if (hideCompleted.value) list = list.filter(w => !isCompleted(w))
  return list.slice().sort((a, b) => (a.name || '').localeCompare(b.name || ''))
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
const totalPages = computed(() => (pageSize.value < 0 ? 1 : Math.max(1, Math.ceil(filtered.value.length / pageSize.value))))
const paged = computed(() => {
  if (pageSize.value < 0) return filtered.value
  const start = current.value * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
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
  const out: { item: Weapon; start: number; col: number }[] = []
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
watch([pageSize, filtered], () => {
  if (current.value >= totalPages.value) current.value = Math.max(0, totalPages.value - 1)
  visibleRange.value = { start: 0, end: Math.min(totalRows.value, 10) }
})

onMounted(() => {
  updateLayoutForWidth(window.innerWidth)
  window.addEventListener('resize', onResize)
  const el = scrollRef.value
  if (el) el.addEventListener('scroll', recompute)
  watch(filtered, () => recompute())
  setTimeout(recompute, 0)
})

// no-op watcher preserved for reactivity
watch(virtualRenderItems, () => {}, { immediate: true })

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
})

// payload shape when WeaponCard emits updates
interface UpdatePayload {
  name: string
  parts_collected?: string[]
  is_mastered?: boolean
  parts?: Part[]
}

function handleUpdate(payload: unknown) {
  if (typeof payload !== 'object' || payload === null) return
  const p = payload as Partial<UpdatePayload>
  if (!p.name) return
  collection.setOverride(p.name, p as Partial<Record<string, unknown>>)
}
</script>

<style scoped>
.weapons-page { max-width:1200px; margin: 16px auto; padding: 16px }
section h3 { margin-top:18px }
.toolbar { display:flex; gap:12px; align-items:center; margin-bottom:12px }
.toolbar input { flex:1; padding:8px; border-radius:6px; border:1px solid #2b2f33; background:#0b0c0d; color:#eee }
.toolbar select { padding:6px 8px; border-radius:6px; background:#0b0c0d; color:#eee; border:1px solid #2b2f33 }
.results { margin-left:auto; color:#9fb8a6 }

/* toggle switch (shared) */
.toggle input { position: absolute; opacity: 0; width: 0; height: 0 }
.toggle .slider { width:40px; height:22px; background: #fff; border-radius: 999px; position: relative; transition: background .12s ease }
.toggle .slider::after { content: ''; position: absolute; left: 3px; top: 3px; width:16px; height:16px; background: var(--toggle-knob, #0b0c0d); border-radius:50%; transition: transform .12s ease }
.toggle input:checked + .slider { background: var(--accent-green, #2bb673) }
.toggle input:checked + .slider::after { transform: translateX(18px); background: #fff }
.toggle .toggle-label { color: var(--muted); font-size:0.95rem }
.card-wrap { width:100%; max-width:340px }
@media (max-width: 640px) {
  .card-wrap { max-width: 92% }
}

/* Ensure the wrapper occupying the virtual cell expands to the row height
   so the inner card (which is set to height:100%) can fill the slot and
   avoid visual overlap between rows. */
.card-wrap { height: 100%; box-sizing: border-box; display: flex; flex-direction: column }

/* touch-friendly virtual scroller */
.virtual-scroll { -webkit-overflow-scrolling: touch; touch-action: pan-y }
</style>
