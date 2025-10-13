<template>
  <div class="weapons-page">
    <h2>Weapons</h2>
    <div class="counts">Total weapons: {{ all.length }}</div>

    <div class="toolbar">
      <input v-model="query" placeholder="Search weapons..." />

      <label>
        Type
        <select v-model="selectedType">
          <option value="all">All</option>
          <option v-for="t in types" :key="t" :value="t">{{ t }}</option>
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
import { computed, ref } from 'vue'
import WeaponCard from '../components/WeaponCard.vue'
import { useCollectionStore } from '../stores/collection'
import type { Weapon } from '../types/weapon'

const collection = useCollectionStore()
const all = computed<Weapon[]>(() => collection.mergedWeapons as Weapon[])

const query = ref('')
const selectedType = ref('all')
const craftedFilter = ref('all') // all | crafted | not-crafted

const types = computed(() => {
  const set = new Set(all.value.map(w => w.type || 'standard'))
  return Array.from(set).sort()
})

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return all.value.filter(w => {
    if (selectedType.value !== 'all' && (w.type || 'standard') !== selectedType.value) return false
    if (craftedFilter.value !== 'all') {
      const wantsCrafted = craftedFilter.value === 'crafted'
      if ((w.is_crafted || false) !== wantsCrafted) return false
    }
    if (!q) return true
    return w.name.toLowerCase().includes(q)
  })
})

const primaries = computed(() => filtered.value.filter(w => w.category === 'primary'))
const secondaries = computed(() => filtered.value.filter(w => w.category === 'secondary'))
const melees = computed(() => filtered.value.filter(w => w.category === 'melee'))

// expose length for results display
const filteredLen = computed(() => filtered.value.length)

function handleUpdate(payload: any) {
  if (!payload || !payload.name) return
  collection.setOverride(payload.name, payload)
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
</style>
