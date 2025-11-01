<template>
  <div class="weapons-page">
    <h2>Weapons</h2>
    <div class="counts">Total weapons: {{ all.length }}</div>

    <div class="toolbar">
      <label>
        Type
        <select v-model="selectedType">
          <option value="all">All</option>
          <option v-for="t in types" :key="t" :value="t" :disabled="!(typeCount(t) > 0)">{{ t }}</option>
        </select>
      </label>

      <label>
        Crafted
        <select v-model="craftedFilter">
          <option value="all">All</option>
          <option value="crafted">Crafted</option>
          <option value="not-crafted">Not crafted</option>
        </select>
      </label>

      <div class="results">Showing {{ filtered.length }} results</div>
    </div>
    
    <section>
      <h3>All weapons</h3>
      <div class="pager" style="display:flex; gap:8px; align-items:center; margin-bottom:8px">
        <label>
          Per page
          <select v-model.number="pageSize">
            <option :value="50">50</option>
            <option :value="100">100</option>
            <option :value="200">200</option>
          </select>
        </label>
        <button @click="prevPage" :disabled="currentPage === 0">Prev</button>
        <div>Page {{ currentPage + 1 }} / {{ totalPages }}</div>
        <button @click="nextPage" :disabled="currentPage >= totalPages - 1">Next</button>
      </div>
      <!-- Virtualized scroller for large lists: only renders visible WeaponCard items -->
      <div ref="scrollRef" class="virtual-scroll" style="height:70vh; overflow:auto;">
        <div :style="{ height: totalHeight + 'px', position: 'relative' }">
            <div v-for="vi in virtualRenderItems" :key="vi.item.name" :style="{ position: 'absolute', top: vi.start + 'px', left: 0, right: 0 }">
              <WeaponCard :weapon="vi.item" @update="handleUpdate" />
            </div>
        </div>
      </div>
      <div class="names" style="margin-top:12px"><strong>All weapons list (full):</strong>
        <ul style="max-height:200px; overflow:auto"><li v-for="w in allSorted" :key="w.name">{{ w.name }}</li></ul>
      </div>
    </section>

    <section>
      <h3>Primary</h3>
      <div class="grid">
        <WeaponCard v-for="w in primaries" :key="w.name" :weapon="w" />
      </div>
      <div class="names"><strong>Primary list:</strong>
        <ul><li v-for="w in primaries" :key="w.name">{{ w.name }}</li></ul>
      </div>
    </section>

    <section>
      <h3>Secondary</h3>
      <div class="grid">
        <WeaponCard v-for="w in secondaries" :key="w.name" :weapon="w" />
      </div>
      <div class="names"><strong>Secondary list:</strong>
        <ul><li v-for="w in secondaries" :key="w.name">{{ w.name }}</li></ul>
      </div>
    </section>

    <section>
      <h3>Melee</h3>
      <div class="grid">
        <WeaponCard v-for="w in melees" :key="w.name" :weapon="w" />
      </div>
      <div class="names"><strong>Melee list:</strong>
        <ul><li v-for="w in melees" :key="w.name">{{ w.name }}</li></ul>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// give component a multi-word name to satisfy eslint vue/multi-word-component-names
defineOptions({ name: 'WeaponsPage' })
import { computed, ref, onMounted, watch } from 'vue'
import WeaponCard from '../components/WeaponCard.vue'
// virtualizer
// no external virtualizer: use a lightweight windowing implementation
import { useCollectionStore } from '../stores/collection'
import type { Weapon, Part, PartWithCollected } from '../types/weapon'

const collection = useCollectionStore()
const all = computed<Weapon[]>(() => collection.mergedWeapons as Weapon[])

const props = defineProps<{ query?: string; hideCompleted?: boolean }>()
const query = computed(() => props.query ?? '')
const hideCompleted = computed(() => Boolean(props.hideCompleted))
const selectedType = ref('all')
const craftedFilter = ref('all') // all | crafted | not-crafted

// canonical type order provided by game taxonomy
const typeOrder: string[] = ['standard', 'prime', 'kuva', 'tenet', 'prisma', 'vandal', 'wraith', 'dex', 'nightwatch']

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

const isCompleted = (w: Weapon) => isCrafted(w) || flagTrue(w.is_mastered)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  let list = all.value.filter(w => {
    if (selectedType.value !== 'all' && (w.type || 'standard') !== selectedType.value) return false
    if (craftedFilter.value !== 'all') {
      const wantsCrafted = craftedFilter.value === 'crafted'
      if (isCrafted(w) !== wantsCrafted) return false
    }
    if (!q) return true
    return w.name.toLowerCase().includes(q)
  })
  if (hideCompleted.value) list = list.filter(w => !isCompleted(w))
  return list
})

const primaries = computed(() => filtered.value.filter(w => w.category === 'primary').slice().sort((a, b) => (a.name || '').localeCompare(b.name || '')))
const secondaries = computed(() => filtered.value.filter(w => w.category === 'secondary').slice().sort((a, b) => (a.name || '').localeCompare(b.name || '')))
const melees = computed(() => filtered.value.filter(w => w.category === 'melee').slice().sort((a, b) => (a.name || '').localeCompare(b.name || '')))

// combined alphabetized list of all filtered weapons
const allSorted = computed(() => filtered.value.slice().sort((a, b) => (a.name || '').localeCompare(b.name || '')))

// Virtualizer + simple pagination setup
const scrollRef = ref<HTMLElement | null>(null)
const itemSize = 320
type VirtualItem = { index: number; start: number; size: number }

// Pagination: allow quick capping of rendered list while diagnosing memory issues
// pageSize = -1 means "All" (no pagination). This preserves previous behavior for tests.
const pageSize = ref(-1)
const currentPage = ref(0)
const totalPages = computed(() => (pageSize.value < 0 ? 1 : Math.max(1, Math.ceil(allSorted.value.length / pageSize.value))))
const pagedAllSorted = computed(() => {
  if (pageSize.value < 0) return allSorted.value
  const start = currentPage.value * pageSize.value
  return allSorted.value.slice(start, start + pageSize.value)
})

const virtualItems = computed(() => {
  const items: VirtualItem[] = []
  const start = visibleRange.value.start
  const end = visibleRange.value.end
  for (let i = start; i < end; i++) items.push({ index: i, start: i * itemSize, size: itemSize })
  return items
})

// Map virtualItems to actual weapon items (non-undefined) for template use
const virtualRenderItems = computed(() => {
  return virtualItems.value
    .map(vi => {
      const item = pagedAllSorted.value[vi.index]
      if (!item) return null
      return { item, start: vi.start }
    })
    .filter(Boolean) as { item: Weapon; start: number }[]
})

const totalHeight = computed(() => pagedAllSorted.value.length * itemSize)

const visibleRange = ref({ start: 0, end: Math.min(pagedAllSorted.value.length, 10) })
const overscan = 5

function recompute() {
  const el = scrollRef.value
  if (!el) return
  const scrollTop = el.scrollTop
  const clientHeight = el.clientHeight || 600
  const start = Math.floor(scrollTop / itemSize) - overscan
  const end = Math.ceil((scrollTop + clientHeight) / itemSize) + overscan
  visibleRange.value.start = Math.max(0, start)
  visibleRange.value.end = Math.min(pagedAllSorted.value.length, end)
}

function prevPage() {
  if (currentPage.value > 0) currentPage.value--
}
function nextPage() {
  if (currentPage.value < totalPages.value - 1) currentPage.value++
}

// keep currentPage valid if pageSize or allSorted length changes
watch([pageSize, allSorted], () => {
  if (currentPage.value >= totalPages.value) currentPage.value = Math.max(0, totalPages.value - 1)
  // reset visibleRange for new page
  visibleRange.value = { start: 0, end: Math.min(pagedAllSorted.value.length, 10) }
})

onMounted(() => {
  const el = scrollRef.value
  if (el) {
    el.addEventListener('scroll', recompute)
  }
  // recompute when list changes
  watch(allSorted, () => recompute())
  // initial compute
  setTimeout(recompute, 0)
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
  // collection.setOverride expects a Partial<Record<string, unknown>>; cast the payload
  // so TypeScript is satisfied while preserving the typed shape locally.
  collection.setOverride(p.name, p as Partial<Record<string, unknown>>)
}
</script>

<style scoped>
.weapons-page { max-width:1200px; margin: 16px auto; padding: 16px }
.grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap:12px }
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
</style>
