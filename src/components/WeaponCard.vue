<template>
  <q-card :class="['card', 'weapon-card', { collected: isAllPartsCollected, gold: isGold, 'has-parts': parts.length > 0 }]" ref="root">
    <div class="card-header">
        <div class="accent" :style="{ background: accentColor }"></div>
        <div class="thumb">
          <img v-if="imgSrc" :src="imgSrc" :alt="weapon.name || 'thumbnail'" class="thumb-img" loading="lazy" @error="onImgError" />
          <img v-else :alt="weapon.name || 'placeholder'" src="/icons/icon-192.svg" class="thumb-img" loading="lazy" />
        </div>
        <div class="title">
          <h3>
            <a :href="wikiUrl(weapon.name)" target="_blank" rel="noopener noreferrer">{{ weapon.name }}</a>
          </h3>
          <div class="meta">
            <span class="badge">{{ weapon.type || 'standard' }}</span>
            <span class="crafted">{{ craftedCount }}/{{ parts.length }} crafted</span>
            <!-- Market badge: shows when a weapon is purchasable from the market (credits/platinum) -->
            <span v-if="marketInfo" class="market-badge" :title="marketTitle">{{ marketLabel }}</span>
            <small v-if="marketInfo && marketInfo.note" class="market-note">{{ marketInfo.note }}</small>
          </div>
        </div>
      </div>
    <div class="content-scroll">
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
                <input type="checkbox" v-model="collected[idx]" @change="toggleCollected(idx)" />
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
  <!-- footer inside the scrollable content but sticky to the bottom so it
             remains visible while parts scroll. This avoids absolute positioning
             and ensures consistent placement across cards. -->
        <div class="check-row footer" style="margin-top:8px">
          <span>Mastered: {{ isMastered ? 'true' : 'false' }}</span>
          <input type="checkbox" v-model="isMastered" @change="onMasterChange" :disabled="!canMaster" :title="masteredTitle" />
        </div>
    </div>
  </q-card>
</template>

<script lang="ts" setup>
import type { Weapon, Part, PartWithCollected } from '../types/weapon'
import { ref, computed, watchEffect, watch, onMounted, onBeforeUnmount } from 'vue'
import { probeImage } from '../lib/imageProbe'

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

// thumbnail support for weapons (lazy-load + fallbacks)
const imgSrc = ref<string | null>(null)
let observer: IntersectionObserver | null = null
// `root` may receive a DOM element or a component instance (PCard). Use
// `unknown` and a runtime type guard so we avoid using `any` and satisfy
// stricter linting rules.
const root = ref<unknown>(null)

async function loadAssetsManifest(): Promise<Record<string, { imageName?: string; wikiaThumbnail?: string }>> {
  try {
    const res = await fetch('/assets/manifest.api.json')
    if (!res.ok) return {}
    const json = await res.json()
    return (json && json.weapons) || {}
  } catch {
    return {}
  }
}

const findScrollParent = (node: Element | null): Element | null => {
  let parent = node && node.parentElement
  while (parent && parent !== document.body) {
    const cs = getComputedStyle(parent)
    const overflowY = cs.overflowY || cs.overflow
    if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') return parent
    parent = parent.parentElement
  }
  return null
}

async function findCdn(name: string, imageName?: string) {
  const candidates: string[] = []
  if (imageName) candidates.push(`https://cdn.warframestat.us/img/${encodeURIComponent(imageName)}`)
  const nameSlug = encodeURIComponent(name.replace(/\s+/g, '-').toLowerCase())
  candidates.push(`https://cdn.warframestat.us/img/${nameSlug}.png`)
  if (name.includes('&')) candidates.push(`https://cdn.warframestat.us/img/${encodeURIComponent(name.replace(/&/g, 'and').replace(/\s+/g, '-').toLowerCase())}.png`)
  for (const cdnUrl of candidates) {
    try {
      const ok = await probeImage(cdnUrl)
      if (ok) return cdnUrl
    } catch {
      // ignore
    }
  }
  return null
}

function isComponentWithEl(x: unknown): x is { $el: Element } {
  const rec = x as Record<string, unknown>
  return !!x && typeof x === 'object' && '$el' in rec && rec['$el'] instanceof Element
}

function startObserving(el: unknown) {
  if (!el || typeof IntersectionObserver === 'undefined') return
  // If a Vue component instance is passed (e.g. PCard ref), resolve to its
  // root DOM element via `$el`. Otherwise assume `el` is already an Element.
  const target: Element | null = isComponentWithEl(el) ? el.$el : (el as Element | null)
  if (!target || !(target instanceof Element)) return
  const rootEl = findScrollParent(target) || null

  const tryLoad = async () => {
    const m = await loadAssetsManifest()
    const w = (m && (m as Record<string, { imageName?: string; wikiaThumbnail?: string }>)[weapon.name]) || undefined
    if (w && w.imageName) {
      const localPath = `/assets/${w.imageName}`
      try {
        const head = await fetch(localPath, { method: 'HEAD' })
        if (head.ok) { imgSrc.value = localPath }
        else if (w.wikiaThumbnail) imgSrc.value = w.wikiaThumbnail
        else {
          const cdn = await findCdn(weapon.name, w.imageName)
          if (cdn) imgSrc.value = cdn
        }
      } catch {
        if (w.wikiaThumbnail) imgSrc.value = w.wikiaThumbnail
      }
    } else if (w && w.wikiaThumbnail) {
      imgSrc.value = w.wikiaThumbnail
    } else {
      const cdn = await findCdn(weapon.name)
      if (cdn) imgSrc.value = cdn
    }
  }

  observer = new IntersectionObserver(async (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      await tryLoad()
      if (observer) { observer.disconnect(); observer = null }
    }
  }, { root: rootEl, rootMargin: '200px' })

  // If there is no scroll parent (i.e. normal grid pages), attempt load immediately
  if (!rootEl) {
    void tryLoad()
  }

  observer.observe(target)
}

async function onImgError(e: Event) {
  try {
    const img = e.target as HTMLImageElement | null
    if (!img) return
    imgSrc.value = null
  const m = await loadAssetsManifest()
  const w = (m && (m as Record<string, { imageName?: string; wikiaThumbnail?: string }>)[weapon.name]) || undefined
    if (w && w.wikiaThumbnail) { imgSrc.value = w.wikiaThumbnail; return }
    const cdn = await findCdn(weapon.name, w && w.imageName)
    if (cdn) imgSrc.value = cdn
  } catch {
    imgSrc.value = null
  }
}

onMounted(() => startObserving(root.value))
onBeforeUnmount(() => { if (observer) observer.disconnect() })

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

function wikiUrl(name: string) {
  try { return `https://wiki.warframe.com/w/${encodeURIComponent(String(name || '').trim())}` }
  catch { return 'https://wiki.warframe.com/' }
}

function getCollectedNames() {
  return parts.value
    .map((p, i) => ({ p: p as PartWithCollected, i }))
    .filter(({ i }) => Boolean(collected.value[i]))
    .map(({ p }) => p.name)
}

function toggleCollected(changedIdx: number) {
  // collected[changedIdx] already reflects the new value via v-model.
  // When a part name appears multiple times (e.g. weapon appears in multiple categories
  // or has duplicate part entries), toggle all parts with the same normalized name
  // so the UI behaves as a single shared part.
  const val = Boolean(collected.value[changedIdx])
  const norm = String((parts.value[changedIdx] as PartWithCollected)?.name || '').trim().toLowerCase()
  if (norm) {
    for (let i = 0; i < parts.value.length; i++) {
      const pn = String((parts.value[i] as PartWithCollected)?.name || '').trim().toLowerCase()
      if (pn === norm) collected.value[i] = val
    }
  }

  // emit updated collected parts and current mastered flag to persist together
  const collectedNames = getCollectedNames()
  try { console.debug('toggleCollected', weapon.name, 'collected:', collected.value, 'all?', isAllPartsCollected.value) } catch {}
  emit('update', { name: weapon.name, parts_collected: collectedNames, is_mastered: isMastered.value })
}

function emitMastered() {
  // include parts_collected when toggling mastered so updates are applied atomically
  const collectedNames = getCollectedNames()
  emit('update', { name: weapon.name, is_mastered: isMastered.value, parts_collected: collectedNames })
}


// Compute whether the Mastered checkbox should be enabled.
// If the weapon has parts, require all parts collected. If it has no parts,
// allow mastering (some weapons are "market-only" but others simply have no parts
// and should still be markable as mastered).
const canMaster = computed(() => {
  if ((parts.value || []).length > 0) return isAllPartsCollected.value
  // allow mastering when there are no parts
  return true
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

function onMasterChange() {
  // v-model already applied the new value; ensure we don't allow enabling when canMaster is false
  if (!canMaster.value && isMastered.value) {
    isMastered.value = false
    // emit update to persist clearing if necessary
    emit('update', { name: weapon.name, is_mastered: false })
    return
  }
  // otherwise emit mastered state along with parts collected
  emitMastered()
}

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
  margin: 0;
}


.card {
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/* ensure the card itself can shrink properly inside the flex cell and clip overflow */
.card { min-height: 0; overflow: hidden }

/* extra bottom padding specifically for weapon cards to avoid cramped actions */
.weapon-card {
  padding-bottom: 18px;
}

/* Scrollable content area inside the card — keeps footer (mastery) visible */
.content-scroll { flex: 1 1 auto; overflow: auto; min-height: 0 }

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

.thumb {
  width: 64px;
  flex: 0 0 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
}
.thumb-img {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 8px;
}

.title h3 {
  margin: 0;
  font-size: 1.05rem;
}

/* Ensure linked names match card text for good contrast */
.title h3 a {
  color: inherit;
  text-decoration: none;
}
.title h3 a:hover {
  text-decoration: underline;
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

/* compact parts list */
.checks { display: flex; flex-direction: column; gap: 8px }
/* Remove internal padding for part rows so parts appear compact */
.check-row { display: flex; justify-content: space-between; align-items: center; padding: 0; background: rgba(255,255,255,0.02); border-radius: 8px }
.check-row span { color: #cfe8d6 }

.row-actions { display:flex; gap:8px; align-items:center }
.toggle-res { background: transparent; border: none; color: #9fb8a6; cursor: pointer; font-size: 0.9rem }
/* Resource lists should also be compact — remove extra padding */
.resources { padding: 0; background: rgba(255,255,255,0.01); border-radius: 6px; margin-top: 6px }
.resource-row { padding: 0; display:flex; align-items:center }
.resource-row label { color: #d6eede }
.resource-row small { color: #9fb8a6; margin-left: 8px }

/* hover affordance */
.card { transition: transform .12s ease, box-shadow .12s ease }
.card:hover { transform: translateY(-4px); box-shadow: 0 8px 30px rgba(2,6,23,0.6) }

/* remove PrimeVue-specific overrides; keep styling applied to our .card */
/* ensure any previous .p-card rules are not required */

.part-left .small { font-size:0.85rem; color:#9fb8a6 }
.resource-row label { color:#d6eede }
.bp-title { margin-top:8px; font-weight:600 }
.progress-bar { background: rgba(255,255,255,0.03); height:8px; border-radius:6px; overflow:hidden }
.progress-fill { height:100%; transition: width .25s; background: #9b5cff }
.check-row { display:flex; justify-content:space-between; align-items:center; padding:0; background:rgba(255,255,255,0.02); border-radius:8px; margin-top:6px }
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
/* removed PrimeVue-specific collected/gold overrides; use .card.collected/.card.gold rules above */
</style>
