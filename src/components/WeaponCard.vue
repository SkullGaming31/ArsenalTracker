<template>
  <div class="card p-card weapon-card">
    <div class="card-header">
      <div class="accent" :style="{ background: accentColor }"></div>
      <div class="title">
        <h3>{{ weapon.name }}</h3>
        <div class="meta">
          <span class="badge">{{ weapon.type || 'standard' }}</span>
          <span class="crafted">{{ craftedCount }}/{{ parts.length }} crafted</span>
        </div>
      </div>
    </div>

    <div class="type">
      <div class="type-top">{{ typeParts[0] }}</div>
      <div class="type-bottom" v-if="typeParts.length > 1">{{ typeParts[1] }}</div>
    </div>

    <div class="progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercent + '%', background: accentColor }"></div>
      </div>
    </div>

    <div class="checks">
      <div v-for="(p, idx) in parts" :key="p.name + idx">
        <div class="check-row">
        <div class="part-left">
          <strong>{{ p.name }}</strong>
          <div class="small">{{ p.resources.length }} resources</div>
        </div>
        <div class="row-actions">
          <input type="checkbox" v-model="p.collected" />
          <button class="toggle-res" @click="toggles[idx] = !toggles[idx]">▾</button>
        </div>
        </div>
        <div class="resources" v-if="toggles[idx]">
          <div v-for="(r, ridx) in p.resources" :key="r.name + ridx" class="resource-row">
            <label>
              <input type="checkbox" v-model="r.collected" /> {{ r.name }} <small>×{{ r.quantity }}</small>
            </label>
          </div>
        </div>
      </div>

      <div class="check-row bp-check">
        <div class="part-left">
          <strong>Blueprint</strong>
          <div class="small">{{ blueprint.length }} resources</div>
        </div>
        <div class="row-actions">
          <input type="checkbox" v-model="blueprintCollected" />
          <button class="toggle-res" @click="showBlueprint = !showBlueprint">▾</button>
        </div>
      </div>

      <div class="bp" v-if="showBlueprint && blueprint.length">
        <div class="bp-title">Main Blueprint</div>
        <div class="bp-res">
          <div v-for="(r, i) in blueprint" :key="r.name + i" class="resource-row">
            <label><input type="checkbox" v-model="r.collected" /> {{ r.name }} <small>×{{ r.quantity }}</small></label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Weapon, Part, Resource } from '../types/weapon'
import { ref, computed, watch, watchEffect } from 'vue'

const props = defineProps<{ weapon: Weapon }>()
type WeaponUpdate = {
  name: string
  parts?: Part[]
  main_blueprint_resources?: Resource[]
  is_crafted?: boolean
  is_mastered?: boolean
}
const emit = defineEmits<{ (e: 'update', payload: WeaponUpdate): void }>()

const weapon = props.weapon

const parts = ref<Part[]>([])
const blueprint = ref<Resource[]>([])
const toggles = ref<boolean[]>([])
const showBlueprint = ref(false)
const blueprintCollected = ref(false)

watchEffect(() => {
  parts.value = (weapon.parts || []).map(p => ({ ...p, resources: (p.resources || []).map(r => ({ ...r })) }))
  blueprint.value = (weapon.main_blueprint_resources || []).map(r => ({ ...r }))
  toggles.value = parts.value.map(() => false)
})

const craftedCount = computed(() => parts.value.filter(p => p.collected).length)
const progressPercent = computed(() => parts.value.length ? Math.round((craftedCount.value / parts.value.length) * 100) : 0)
const accentColor = computed(() => String(weapon.type || '').toLowerCase().includes('prime') ? '#9b5cff' : '#2bb673')

const typeParts = computed(() => {
  let raw = String(weapon.type || '')
  raw = raw.replace(/\bnon[-\s]*prime\b/gi, (m) => m.replace(/\s+/g, '-'))
  const parts = raw.split(/\s*[|,\\\+]\s*|\s+and\s+/i).filter(Boolean)
  if (parts.length === 0) return ['']
  if (parts.length === 1) return [parts[0]]
  return [parts[0], parts.slice(1).join(' / ')]
})

// auto-check a part if all its resources are marked collected
const partAllResources = (p: Part) => p.resources && p.resources.length > 0 && p.resources.every(r => Boolean(r.collected))

watch(parts, (newParts) => {
  newParts.forEach(p => {
    if (partAllResources(p) && !p.collected) p.collected = true
  })
  // emit an update so parent can persist
  emit('update', { name: weapon.name, parts: newParts.map(p => ({ ...p })) , main_blueprint_resources: blueprint.value.map(r => ({ ...r })), is_crafted: weapon.is_crafted, is_mastered: weapon.is_mastered })
}, { deep: true })

// blueprint auto-check
const blueprintAllResources = computed(() => blueprint.value.length > 0 && blueprint.value.every(r => Boolean(r.collected)))
watch(blueprintAllResources, (val) => {
  if (val && !blueprintCollected.value) blueprintCollected.value = true
})

watch(blueprint, () => {
  emit('update', { name: weapon.name, parts: parts.value.map(p => ({ ...p })), main_blueprint_resources: blueprint.value.map(r => ({ ...r })), is_crafted: weapon.is_crafted, is_mastered: weapon.is_mastered })
}, { deep: true })

</script>

<style scoped>
.card {
  border: 1px solid #444;
  border-radius: 8px;
  padding: 12px;
  background: #1a1a1a;
  color: #eee;
  margin: 8px;
}

.type {
  display: flex;
  flex-direction: column;
}

.type-top {
  font-weight: 600;
  white-space: nowrap;
  hyphens: none;
}

.type-bottom {
  font-size: 0.9em;
  color: #bbb;
  white-space: nowrap;
  hyphens: none;
}

.card-header {
  display: flex;
  align-items: stretch;
  margin-bottom: 10px;
}

.accent {
  width: 6px;
  border-radius: 6px 0 0 6px;
  margin-right: 12px;
}

.title h3 {
  margin: 0;
  font-size: 1.05rem;
}

.meta {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 6px;
}

.badge {
  background: rgba(255,255,255,0.06);
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 0.75rem;
  color: #ffd54a;
}

.crafted {
  font-size: 0.8rem;
  color: #ddd;
}

.progress { margin: 8px 0 12px 0 }
.progress-bar { background: rgba(255,255,255,0.03); height: 8px; border-radius: 6px; overflow: hidden }
.progress-fill { height: 100%; transition: width .25s ease }

.checks { display: flex; flex-direction: column; gap: 8px }
.check-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: rgba(255,255,255,0.02); border-radius: 8px }
.check-row span { color: #cfe8d6 }

.row-actions { display:flex; gap:8px; align-items:center }
.toggle-res { background: transparent; border: none; color: #9fb8a6; cursor: pointer; font-size: 0.9rem }
.resources { padding: 8px 10px 10px 10px; background: rgba(255,255,255,0.01); border-radius: 6px; margin-top: 6px }
.resource-row { padding: 6px 4px; display:flex; align-items:center }
.resource-row label { color: #d6eede }
.resource-row small { color: #9fb8a6; margin-left: 8px }

/* hover affordance */
.card { transition: transform .12s ease, box-shadow .12s ease }
.card:hover { transform: translateY(-4px); box-shadow: 0 8px 30px rgba(2,6,23,0.6) }

/* PrimeVue overrides to keep dark theme */
.p-card.card { background: #111318 !important; color: #eee !important; border: 1px solid #2b2f33 !important }
.p-card.card .p-card-body,
.p-card.card .p-card-title,
.p-card.card .p-card-subtitle { color: inherit !important }
.p-badge { background: rgba(255,255,255,0.06) !important; color: #ffd54a !important }

.part-left .small { font-size:0.85rem; color:#9fb8a6 }
.resource-row label { color:#d6eede }
.bp-title { margin-top:8px; font-weight:600 }
.progress-bar { background: rgba(255,255,255,0.03); height:8px; border-radius:6px; overflow:hidden }
.progress-fill { height:100%; transition: width .25s }
.check-row { display:flex; justify-content:space-between; align-items:center; padding:8px; background:rgba(255,255,255,0.02); border-radius:8px; margin-top:6px }
.row-actions { display:flex; gap:8px; align-items:center }
.toggle-res { background:transparent; border:none; cursor:pointer; color:#9fb8a6 }
</style>
