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
        <div>Crafted</div>
        <q-select dense outlined v-model="craftedFilter" :options="craftedOptions" style="min-width:160px" emit-value />
      </div>

      <div class="results">Showing {{ filtered.length }} results</div>
    </div>
    
    <!-- Removed the combined "All weapons" scroller per request. Keep Primary/Secondary/Melee sections only. -->

    <section>
      <h3>Primary</h3>
      <div class="grid">
        <WeaponCard v-for="w in primaries" :key="w.name" :weapon="w" @update="handleUpdate" />
      </div>
      
    </section>

    <section>
      <h3>Secondary</h3>
      <div class="grid">
        <WeaponCard v-for="w in secondaries" :key="w.name" :weapon="w" @update="handleUpdate" />
      </div>
      
    </section>

    <section>
      <h3>Melee</h3>
      <div class="grid">
        <WeaponCard v-for="w in melees" :key="w.name" :weapon="w" @update="handleUpdate" />
      </div>
      
    </section>
  </div>
</template>

<script setup lang="ts">
// give component a multi-word name to satisfy eslint vue/multi-word-component-names
defineOptions({ name: 'WeaponsPage' })
import { computed, ref } from 'vue'
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

// QSelect option arrays
const typeOptions = computed(() => {
  return [
    { label: 'All', value: 'all' },
    ...types.value.map(t => ({ label: String(t), value: t, disable: !(typeCount(t) > 0) }))
  ]
})

const craftedOptions = [
  { label: 'All', value: 'all' },
  { label: 'Crafted', value: 'crafted' },
  { label: 'Not crafted', value: 'not-crafted' }
]

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

// combined alphabetized list of all filtered weapons (not used when showing separate sections)
// kept for potential future use
// const allSorted = computed(() => filtered.value.slice().sort((a, b) => (a.name || '').localeCompare(b.name || '')))

// Note: removed the combined virtual scroller and pagination.
// The page now displays separate Primary, Secondary, and Melee sections only.

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
