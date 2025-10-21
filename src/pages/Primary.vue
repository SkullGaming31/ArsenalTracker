<template>
  <div class="page">
    <h2>Primary Weapons</h2>
    <div class="toolbar">
      <input v-model="query" placeholder="Search primaries..." />
      <label class="toggle" style="margin-left:12px; display:inline-flex; align-items:center; gap:8px">
        <input type="checkbox" v-model="hideCompleted" />
        <span class="slider" aria-hidden></span>
        <span class="toggle-label">Hide completed</span>
      </label>
      <div class="results">Showing {{ filtered.length }} results</div>
    </div>
    <div class="grid">
      <WeaponCard v-for="w in filtered" :key="w.name" :weapon="w" />
    </div>
    <div class="names"><ul><li v-for="w in filtered" :key="w.name">{{ w.name }}</li></ul></div>
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
const hideCompleted = ref(false)

const flagTrue = (v: any) => {
  if (v === true) return true
  if (v === false) return false
  if (typeof v === 'string') return v.toLowerCase() === 'true'
  if (typeof v === 'number') return v !== 0
  return Boolean(v)
}

const isCompleted = (w: Weapon) => flagTrue((w as any).is_crafted) || flagTrue((w as any).is_mastered)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  let list = all.value.filter(w => w.category === 'primary' && (!q || w.name.toLowerCase().includes(q)))
  if (hideCompleted.value) list = list.filter(w => !isCompleted(w))
  return list
})
</script>

<style scoped>
.grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap:12px }
.toolbar { display:flex; gap:12px; align-items:center; margin-bottom:12px }
.toolbar input { flex:1; padding:8px; border-radius:6px; border:1px solid #2b2f33; background:#0b0c0d; color:#eee }
.results { margin-left:auto; color:#9fb8a6 }

/* toggle switch (shared) */
.toggle input { position: absolute; opacity: 0; width: 0; height: 0 }
.toggle .slider { width:40px; height:22px; background: #fff; border-radius: 999px; position: relative; transition: background .12s ease }
.toggle .slider::after { content: ''; position: absolute; left: 3px; top: 3px; width:16px; height:16px; background: var(--toggle-knob, #0b0c0d); border-radius:50%; transition: transform .12s ease }
.toggle input:checked + .slider { background: var(--accent-green, #2bb673) }
.toggle input:checked + .slider::after { transform: translateX(18px); background: #fff }
.toggle .toggle-label { color: var(--muted); font-size:0.95rem }
</style>
