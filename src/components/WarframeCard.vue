<template>
  <div class="card p-card">
    <div class="card-header">
      <div class="accent" :style="{ background: accentColor }"></div>
      <div class="thumb">
        <img v-if="imgSrc" :src="imgSrc" alt="thumbnail" class="thumb-img" />
        <img v-else src="/icons/icon-192.svg" alt="placeholder" class="thumb-img" />
      </div>
      <div class="title">
  <h3 v-html="highlightedName"></h3>
        <div class="meta">
          <span class="badge">{{ typeParts[0] }}</span>
          <span class="crafted">{{ craftedCount }}/4 crafted</span>
        </div>
      </div>
    </div>
    <div class="type">
      <div class="type-top">{{ typeParts[0] }}</div>
      <div class="type-bottom" v-if="typeParts.length > 1">{{ typeParts[1] }}</div>
    </div>
    <div class="progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercent + '%' , background: accentColor }"></div>
      </div>
    </div>

    <div class="checks">
      <div class="check-row">
        <span>Neuroptics: {{ neuropticsCollected ? 'true' : 'false' }}</span>
          <div class="row-actions">
          <input type="checkbox" v-model="neuropticsCollected" />
          <button class="toggle-res" @click="showNeuroptics = !showNeuroptics">▾</button>
        </div>
      </div>
      <div class="resources" v-if="showNeuroptics">
        <div v-for="(r, idx) in neuropticsResources" :key="r.name + idx" class="resource-row">
          <label>
            <input type="checkbox" v-model="r.collected" /> {{ r.name }} <small>×{{ r.quantity }}</small>
          </label>
        </div>
      </div>

      <div class="check-row">
        <span>Chassis: {{ chassisCollected ? 'true' : 'false' }}</span>
          <div class="row-actions">
          <input type="checkbox" v-model="chassisCollected" />
          <button class="toggle-res" @click="showChassis = !showChassis">▾</button>
        </div>
      </div>
      <div class="resources" v-if="showChassis">
        <div v-for="(r, idx) in chassisResources" :key="r.name + idx" class="resource-row">
          <label>
            <input type="checkbox" v-model="r.collected" /> {{ r.name }} <small>×{{ r.quantity }}</small>
          </label>
        </div>
      </div>

      <div class="check-row">
        <span>Systems: {{ systemsCollected ? 'true' : 'false' }}</span>
          <div class="row-actions">
          <input type="checkbox" v-model="systemsCollected" />
          <button class="toggle-res" @click="showSystems = !showSystems">▾</button>
        </div>
      </div>
      <div class="resources" v-if="showSystems">
        <div v-for="(r, idx) in systemsResources" :key="r.name + idx" class="resource-row">
          <label>
            <input type="checkbox" v-model="r.collected" /> {{ r.name }} <small>×{{ r.quantity }}</small>
          </label>
        </div>
      </div>

      <div class="check-row">
        <span>Blueprint: {{ blueprintCollected ? 'true' : 'false' }}</span>
          <div class="row-actions">
          <input type="checkbox" v-model="blueprintCollected" />
          <button class="toggle-res" @click="showBlueprint = !showBlueprint">▾</button>
        </div>
      </div>
      <div class="resources" v-if="showBlueprint">
        <div v-for="(r, idx) in blueprintResources" :key="r.name + idx" class="resource-row">
          <label>
            <input type="checkbox" v-model="r.collected" /> {{ r.name }} <small>×{{ r.quantity }}</small>
          </label>
        </div>
      </div>

      <div class="check-row">
        <span>Mastered: {{ isMastered ? 'true' : 'false' }}</span>
        <input type="checkbox" v-model="isMastered" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Warframe, Resource } from "../types/warframe";

const props = defineProps<{ warframe: Warframe, highlight?: string }>()
type WarframeUpdate = {
  name: string
  neuroptics_collected: boolean
  chassis_collected: boolean
  systems_collected: boolean
  blueprint_collected: boolean
  is_mastered: boolean
  neuroptics_resources?: Resource[]
  chassis_resources?: Resource[]
  systems_resources?: Resource[]
  blueprint_resources?: Resource[]
}
const emit = defineEmits<{ (e: 'update', payload: WarframeUpdate): void }>()
// keep `warframe` as a reactive ref so updates from parent propagate
import { ref, watch, computed, toRef, watchEffect } from 'vue'
import { onMounted, onBeforeUnmount } from 'vue'
const warframe = toRef(props as { warframe: Warframe }, 'warframe')

// local reactive copies so checkboxes can be toggled (props are readonly)
const neuropticsCollected = ref(false)
const chassisCollected = ref(false)
const systemsCollected = ref(false)
const blueprintCollected = ref(false)
const isMastered = ref(false)

// local resource arrays (cloned so we can mutate locally)
const neuropticsResources = ref<Resource[]>([])
const chassisResources = ref<Resource[]>([])
const systemsResources = ref<Resource[]>([])
const blueprintResources = ref<Resource[]>([])

// toggles for showing resource lists
const showNeuroptics = ref(false)
const showChassis = ref(false)
const showSystems = ref(false)
const showBlueprint = ref(false)

// thumbnail state
const imgSrc = ref<string | null>(null)
let observer: IntersectionObserver | null = null
let manifestCache: Record<string, string> | null = null

async function loadAssetsManifest() {
  if (manifestCache) return manifestCache
  try {
    const res = await fetch('/assets/manifest.json')
    if (!res.ok) return (manifestCache = {})
    const json = await res.json()
    manifestCache = json.thumbnails || {}
    return manifestCache
  } catch (e) {
    manifestCache = {}
    return manifestCache
  }
}

function startObserving(el: Element | null) {
  if (!el || typeof IntersectionObserver === 'undefined') return
  observer = new IntersectionObserver(async (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        // attempt to load thumbnail from manifest
  const m = await loadAssetsManifest() || {}
  const name = String(warframe.value?.name || '')
  const path = (m as Record<string, string>)[name]
  if (path) imgSrc.value = path
        // stop observing once attempted
        if (observer) { observer.disconnect(); observer = null }
      }
    }
  }, { rootMargin: '200px' })
  observer.observe(el)
}

onMounted(() => {
  const el = document.querySelector('.card')
  startObserving(el)
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
})

// initialize local state when `warframe` prop arrives/changes
watchEffect(() => {
  const w = warframe.value || ({} as Warframe)
  neuropticsCollected.value = Boolean(w.neuroptics_collected)
  chassisCollected.value = Boolean(w.chassis_collected)
  systemsCollected.value = Boolean(w.systems_collected)
  blueprintCollected.value = Boolean(w.blueprint_collected)
  isMastered.value = Boolean(w.is_mastered)

  neuropticsResources.value = (w.neuroptics_resources || []).map(r => ({ ...r }))
  chassisResources.value = (w.chassis_resources || []).map(r => ({ ...r }))
  systemsResources.value = (w.systems_resources || []).map(r => ({ ...r }))
  blueprintResources.value = (w.blueprint_resources || []).map(r => ({ ...r }))
})

// when any toggle changes, emit an update with the new state (parent can listen)
watch(
  [neuropticsCollected, chassisCollected, systemsCollected, blueprintCollected, isMastered, neuropticsResources, chassisResources, systemsResources, blueprintResources],
  () => {
    emit('update', {
      name: warframe.value?.name || '',
      neuroptics_collected: neuropticsCollected.value,
      chassis_collected: chassisCollected.value,
      systems_collected: systemsCollected.value,
      blueprint_collected: blueprintCollected.value,
      is_mastered: isMastered.value,
      neuroptics_resources: neuropticsResources.value.map(r => ({ ...r })),
      chassis_resources: chassisResources.value.map(r => ({ ...r })),
      systems_resources: systemsResources.value.map(r => ({ ...r })),
      blueprint_resources: blueprintResources.value.map(r => ({ ...r })),
    })
  },
  { deep: true, flush: 'sync' }
)

// computed visual stats
const craftedCount = computed(() =>
  [neuropticsCollected.value, chassisCollected.value, systemsCollected.value, blueprintCollected.value].filter(Boolean).length
)

const progressPercent = computed(() => Math.round((craftedCount.value / 4) * 100))

// simple accent color per type (prime vs non-prime)
const accentColor = computed(() => (String(warframe.value?.type || '').toLowerCase().includes('prime') ? '#9b5cff' : '#2bb673'))

// split type into up to two parts for top/bottom display
const typeParts = computed(() => {
  let raw = String(warframe.value?.type || '')
  // normalize common non-prime forms so they remain a single token
  raw = raw.replace(/\bnon[-\s]*prime\b/gi, (m) => m.replace(/\s+/g, '-'))
  // common delimiters between types; we've already normalized non-prime so it won't split on '-'
  const parts = raw.split(/\s*[|,\\\+]\s*|\s+and\s+/i).filter(Boolean)
  if (parts.length === 0) return ['']
  if (parts.length === 1) return [parts[0]]
  // if more than 2, show first as top and rest joined as bottom
  return [parts[0], parts.slice(1).join(' / ')]
})

// highlightedName: if props.highlight provided, wrap the first occurrence in a <mark>
const highlightedName = computed(() => {
  const name = String(warframe.value?.name || '')
  const hl = (props as any).highlight || ''
  if (!hl) return name
  try {
    const idx = name.toLowerCase().indexOf(String(hl).toLowerCase())
    if (idx === -1) return name
    const before = name.slice(0, idx)
    const match = name.slice(idx, idx + hl.length)
    const after = name.slice(idx + hl.length)
    return `${before}<mark>${match}</mark>${after}`
  } catch (e) {
    return name
  }
})

// If all resources for a part are collected, mark that part as collected (ready to craft)
const neuropticsAllResourcesCollected = computed(() => neuropticsResources.value.length > 0 && neuropticsResources.value.every(r => Boolean(r.collected)))
const chassisAllResourcesCollected = computed(() => chassisResources.value.length > 0 && chassisResources.value.every(r => Boolean(r.collected)))
const systemsAllResourcesCollected = computed(() => systemsResources.value.length > 0 && systemsResources.value.every(r => Boolean(r.collected)))
const blueprintAllResourcesCollected = computed(() => blueprintResources.value.length > 0 && blueprintResources.value.every(r => Boolean(r.collected)))

watch(neuropticsAllResourcesCollected, (val) => {
  if (val && !neuropticsCollected.value) neuropticsCollected.value = true
})
watch(chassisAllResourcesCollected, (val) => {
  if (val && !chassisCollected.value) chassisCollected.value = true
})
watch(systemsAllResourcesCollected, (val) => {
  if (val && !systemsCollected.value) systemsCollected.value = true
})
watch(blueprintAllResourcesCollected, (val) => {
  if (val && !blueprintCollected.value) blueprintCollected.value = true
})
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
  /* prevent breaking like "non-" on one line and "prime" on the next */
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

.card {
  transition: transform .12s ease, box-shadow .12s ease;
}
.card:hover { transform: translateY(-4px); box-shadow: 0 8px 30px rgba(2,6,23,0.6) }

/* PrimeVue overrides to keep dark theme */
.p-card.card {
  background: #111318 !important;
  color: #eee !important;
  border: 1px solid #2b2f33 !important;
}
.p-card.card .p-card-body,
.p-card.card .p-card-title,
.p-card.card .p-card-subtitle {
  color: inherit !important;
}
.p-badge {
  background: rgba(255,255,255,0.06) !important;
  color: #ffd54a !important;
}
</style>
