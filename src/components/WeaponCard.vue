<template>
  <div :class="['card', 'p-card', 'weapon-card', { collected: isAllPartsCollected, gold: isGold }]">
    <div class="card-header">
        <div class="accent" :style="{ background: accentColor }"></div>
        <div class="title">
          <h3>{{ weapon.name }}</h3>
          <div class="meta">
            <span class="badge">{{ weapon.type || 'standard' }}</span>
            <span class="crafted">{{ craftedCount }}/{{ parts.length }} crafted</span>
            <!-- Market badge: shows when a weapon is purchasable from the market (credits/platinum) -->
            <span v-if="marketInfo" class="market-badge" :title="marketTitle">{{ marketLabel }}</span>
            <small v-if="marketInfo && marketInfo.note" class="market-note">{{ marketInfo.note }}</small>
          </div>
        </div>
      </div>

    <div class="type">
      <div class="type-top">{{ typeParts[0] }}</div>
      <div class="type-bottom" v-if="typeParts.length > 1">{{ typeParts[1] }}</div>
    </div>

    <div class="progress">
      <div class="progress-bar">
        <!-- bind width only; color is now fixed via CSS to be purple -->
        <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
    </div>

    <div class="checks">
      <div v-for="(p, idx) in parts" :key="p.name + idx">
        <div class="check-row">
          <div class="part-left">
            <strong>{{ p.name }}</strong>
            <div class="small" v-if="p.relics && p.relics.length">{{ p.relics.length }} relics</div>
            <div class="small" v-else-if="(p.resources || []).length">{{ (p.resources || []).length }} resources</div>
            <div class="small" v-else-if="p.count">×{{ p.count }}</div>
          </div>
          <div class="row-actions">
            <!-- use v-model so Vue updates collected[idx] before change handler runs -->
            <input type="checkbox" v-model="collected[idx]" @change="toggleCollected" />
            <button v-if="(p.resources || []).length || (p.relics || []).length" class="toggle-res" @click="toggles[idx] = !toggles[idx]">▾</button>
          </div>
        </div>

        <div class="resources" v-if="toggles[idx]">
          <div v-if="p.relics && p.relics.length" class="relics">
            <div v-for="(r, ridx) in p.relics" :key="r.relicName + ridx" class="resource-row relic-row">
              <div class="relic-main">
                <strong class="relic-name">{{ r.relicName }}</strong>
                <span class="relic-badge" :style="{ background: rarityColor(r.rarity) }">{{ r.rarity }}</span>
              </div>
              <div class="relic-versions">
                <span v-for="(v, vi) in r.versions" :key="v + vi" class="relic-version">{{ v }}</span>
              </div>
            </div>
          </div>

          <div v-if="p.resources && p.resources.length" class="bp-res">
            <div v-for="(r, i) in p.resources" :key="r.name + i" class="resource-row">
              <div>{{ r.name }} <small>×{{ r.quantity }}</small></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="check-row" style="margin-top:8px">
      <span>Mastered: {{ isMastered ? 'true' : 'false' }}</span>
  <input type="checkbox" v-model="isMastered" @change="emitMastered" :disabled="!canMaster" :title="masteredTitle" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Weapon, Part, PartWithCollected } from '../types/weapon'
import { ref, computed, watchEffect, watch } from 'vue'

const props = defineProps<{ weapon: Weapon }>()
const emit = defineEmits<{
  (e: 'update', payload: { name: string; parts?: Part[]; is_mastered?: boolean; parts_collected?: string[] }): void
}>()

const weapon = props.weapon

const parts = ref<Part[]>([])
const toggles = ref<boolean[]>([])
// local, ephemeral collected state (UI-only since types don't include collected)
const collected = ref<boolean[]>([])
// local mastered flag (so user can toggle on the card)
const isMastered = ref<boolean>(false)

watchEffect(() => {
  parts.value = (weapon.parts || []).map(p => ({
    ...p,
    resources: (p.resources || []).map(r => ({ ...r })),
    relics: (p.relics || []).map(r => ({ ...r }))
  }))
  toggles.value = parts.value.map(() => false)
  // reset collected UI state when weapon changes
  // initialize collected state from either part objects (p.collected) or overrides stored as `collected_parts`/`parts_collected`
  const rawCollected = weapon.collected_parts ?? weapon.parts_collected
  const collectedOverride: string[] = Array.isArray(rawCollected) ? rawCollected : []
  collected.value = parts.value.map(p => {
    if (typeof p === 'string') return false
    const pw = p as PartWithCollected
    const byPart = Boolean(pw.collected)
    const byOverride = collectedOverride.includes(pw.name)
    return byPart || byOverride
  })
  // initialize mastered flag from incoming prop
  isMastered.value = Boolean(weapon.is_mastered)
})

const craftedCount = computed(() => collected.value.filter(Boolean).length)
const progressPercent = computed(() => parts.value.length ? Math.round((craftedCount.value / parts.value.length) * 100) : 0)
const accentColor = computed(() => String(weapon.type || '').toLowerCase().includes('prime') ? '#9b5cff' : '#2bb673')

// whether all named parts are marked collected (local UI state)
const isAllPartsCollected = computed(() => parts.value.length > 0 && collected.value.length === parts.value.length && collected.value.every(Boolean))

// gold state: mastered -> gold regardless of part collection. If you want gold only when
// both mastered and all parts collected, change this to use && instead of simple check.
const isGold = computed(() => Boolean(isMastered.value))

const typeParts = computed(() => {
  let raw = String(weapon.type || '')
  raw = raw.replace(/\bnon[-\s]*prime\b/gi, (m) => m.replace(/\s+/g, '-'))
  const parts = raw.split(/\s*[|,\\+]\s*|\s+and\s+/i).filter(Boolean)
  if (parts.length === 0) return ['']
  if (parts.length === 1) return [parts[0]]
  return [parts[0], parts.slice(1).join(' / ')]
})

const marketInfo = computed(() => {
  // Support a few possible shapes from data: `market`, `purchase`, or legacy `market_price`/`market_currency`
  const w = weapon
  if (w.market && (w.market.price || w.market.method)) return w.market
  if (w.purchase && (w.purchase.price || w.purchase.method)) return w.purchase
  if (w.market_price) return { price: w.market_price, currency: w.market_currency || 'Credits' }
  return null
})

const marketLabel = computed(() => {
  if (!marketInfo.value) return ''
  const m = marketInfo.value
  if (m.method && m.method.toLowerCase() === 'market') return `${m.currency ? m.currency + ' ' : ''}${m.price ? formatCurrency(m.price) : ''}`
  if (m.price) return `${m.currency || 'Credits'} ${formatCurrency(m.price)}`
  return String(m.method || 'Market')
})

const marketTitle = computed(() => {
  if (!marketInfo.value) return ''
  const m = marketInfo.value
  return m.note || `${m.currency || 'Credits'} ${m.price || ''}`
})

function formatCurrency(n: number){
  try { return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') }
  catch { return String(n) }
}

function toggleCollected() {
  // collected[idx] is bound with v-model so it already reflects the new value.
  // emit updated collected parts to persist in overrides
  const collectedNames = parts.value
    .map((p, i) => ({ p: p as PartWithCollected, i }))
    .filter(({ i }) => Boolean(collected.value[i]))
    .map(({ p }) => p.name)
  // debug info to help diagnose class binding issues
  try { console.debug('toggleCollected', weapon.name, 'collected:', collected.value, 'all?', isAllPartsCollected.value) } catch {}
  emit('update', { name: weapon.name, parts_collected: collectedNames })
}

function emitMastered() {
  emit('update', { name: weapon.name, is_mastered: isMastered.value })
}

// Allow mastered for market-only weapons which have no parts. Compute whether
// the Mastered checkbox should be enabled.
const canMaster = computed(() => {
  // if there are parts, require all collected; if there are no parts, allow
  // mastering only when this weapon is purchasable from the market.
  if ((parts.value || []).length > 0) return isAllPartsCollected.value
  return Boolean(marketInfo.value)
})

const masteredTitle = computed(() => {
  if (canMaster.value) return 'Mark mastered'
  if ((parts.value || []).length === 0 && marketInfo.value) return 'Mark mastered (market-only)'
  return 'Collect all parts before mastering'
})

// Watch canMaster and clear mastered if it becomes false (but only when
// necessary). This prevents clearing mastered for market-only weapons.
watch(canMaster, (allowed) => {
  if (!allowed && isMastered.value) {
    isMastered.value = false
    emit('update', { name: weapon.name, is_mastered: false })
  }
})

function rarityColor(rarity: string){
  switch(String(rarity||'').toLowerCase()){
    case 'common': return '#9fb8a6'
    case 'uncommon': return '#ffd54a'
    case 'rare': return '#9b5cff'
    default: return '#777'
  }
}

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

.market-badge {
  background: rgba(255,255,255,0.04);
  color: #6fd3ff;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 0.75rem;
  margin-left: 6px;
}

.market-note {
  display: block;
  font-size: 0.75rem;
  color: #9fd8ff;
  margin-left: 6px;
  margin-top: 2px;
}

.crafted {
  font-size: 0.8rem;
  color: #ddd;
}

.progress { margin: 8px 0 12px 0 }
.progress-bar { background: rgba(255,255,255,0.03); height: 8px; border-radius: 6px; overflow: hidden }
.progress-fill { height: 100%; transition: width .25s ease; background: #9b5cff }

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
.progress-fill { height:100%; transition: width .25s; background: #9b5cff }
.check-row { display:flex; justify-content:space-between; align-items:center; padding:8px; background:rgba(255,255,255,0.02); border-radius:8px; margin-top:6px }
.row-actions { display:flex; gap:8px; align-items:center }
.toggle-res { background:transparent; border:none; cursor:pointer; color:#9fb8a6 }

.relic-row { display:flex; flex-direction:column; gap:6px }
.relic-main { display:flex; align-items:center; gap:8px }
.relic-badge { color: #111; padding: 2px 8px; border-radius: 999px; font-size:0.75rem }
.relic-versions { margin-top:6px; display:flex; gap:6px; flex-wrap:wrap }
.relic-version { background: rgba(255,255,255,0.04); padding: 2px 6px; border-radius:6px; font-size:0.75rem }

/* Visual states when all parts are collected or mastered */
.card.collected {
  border-color: #2bb673; /* green border */
  box-shadow: 0 8px 30px rgba(43,182,115,0.08);
  background: linear-gradient(180deg, rgba(43,182,115,0.03), rgba(0,0,0,0.12));
}
.card.collected .badge { color: #2bb673 }

.card.gold {
  border-color: #ffd54a; /* gold border */
  box-shadow: 0 8px 30px rgba(255,213,74,0.08);
  background: linear-gradient(180deg, rgba(255,213,74,0.03), rgba(0,0,0,0.12));
}
.card.gold .badge { color: #ffd54a }

/* PrimeVue sets a strong background on .p-card.card using !important; override that
   so the entire card background/border changes when collected/gold states are active. */
.p-card.card.collected {
  background: linear-gradient(180deg, rgba(43,182,115,0.04), rgba(0,0,0,0.14)) !important;
  border-color: #2bb673 !important;
  box-shadow: 0 10px 40px rgba(43,182,115,0.12) !important;
}
.p-card.card.collected .title h3 { color: #d7f7e8 !important }

.p-card.card.gold {
  background: linear-gradient(180deg, rgba(255,213,74,0.04), rgba(0,0,0,0.14)) !important;
  border-color: #ffd54a !important;
  box-shadow: 0 10px 40px rgba(255,213,74,0.12) !important;
}
.p-card.card.gold .title h3 { color: #fff7dc !important }
</style>
