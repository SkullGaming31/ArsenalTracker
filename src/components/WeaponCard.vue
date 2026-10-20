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
  try {
    const s = String(name || '').trim()
    if (!s) return 'https://wiki.warframe.com/'
    const capitalize = (t: string) => t.length ? (t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()) : t
    const tokens = s.split(/\s+/).map(t => {
      if (t === '&' || t.toLowerCase() === 'and') return '%26'
      return encodeURIComponent(capitalize(t))
    })
    return `https://wiki.warframe.com/w/${tokens.join('_')}`
  } catch {
    return 'https://wiki.warframe.com/'
  }
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
  border: 1px solid #2a4a5a;
  border-radius: 12px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(10, 20, 30, 0.95), rgba(20, 35, 50, 0.9));
  color: #e8f6ee;
  margin: 0;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.card {
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/* Hexagonal pattern overlay */
.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='rgba(255,255,255,0.03)' stroke-width='0.5'/%3E%3C/svg%3E");
  background-size: 60px 60px;
  opacity: 0.4;
  pointer-events: none;
  z-index: 0;
}

/* Scanline effect */
.card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.03) 2px,
    rgba(0, 0, 0, 0.03) 4px
  );
  pointer-events: none;
  z-index: 1;
}

/* Ensure content sits above overlays */
.card > * {
  position: relative;
  z-index: 2;
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
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #00d4ff;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
}

.type-bottom {
  font-size: 0.9em;
  color: #8faab5;
  white-space: nowrap;
  hyphens: none;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.card-header {
  display: flex;
  align-items: stretch;
  margin-bottom: 12px;
  gap: 12px;
}

.accent {
  width: 4px;
  border-radius: 4px 0 0 4px;
  margin-right: 12px;
  position: relative;
  box-shadow: 0 0 10px currentColor;
}

.thumb {
  width: 72px;
  flex: 0 0 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  position: relative;
}

.thumb::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border: 2px solid rgba(0, 212, 255, 0.3);
  border-radius: 12px;
  animation: pulse-border 3s ease-in-out infinite;
}

@keyframes pulse-border {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

.thumb-img {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 10px;
  position: relative;
  z-index: 2;
}

.title h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #e8f6ee;
  text-shadow: 0 0 8px rgba(0, 212, 255, 0.2);
}

/* Ensure linked names match card text for good contrast */
.title h3 a {
  color: inherit;
  text-decoration: none;
  position: relative;
}

.title h3 a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #00d4ff, #00ff88);
  transition: width 0.3s ease;
}

.title h3 a:hover::after {
  width: 100%;
}

.meta {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 8px;
  flex-wrap: wrap;
}

.badge {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(0, 212, 255, 0.05));
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  color: #00d4ff;
  border: 1px solid rgba(0, 212, 255, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
  box-shadow: 0 0 8px rgba(0, 212, 255, 0.2);
}

.market-badge {
  background: linear-gradient(135deg, rgba(111, 211, 255, 0.15), rgba(111, 211, 255, 0.05));
  color: #6fd3ff;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  margin-left: 6px;
  border: 1px solid rgba(111, 211, 255, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
  box-shadow: 0 0 8px rgba(111, 211, 255, 0.2);
}

.market-note {
  display: block;
  font-size: 0.75rem;
  color: #9fd8ff;
  margin-left: 6px;
  margin-top: 2px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.crafted {
  font-size: 0.8rem;
  color: #a8c8d8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.progress { margin: 12px 0 }
.progress-bar {
  background: rgba(0, 0, 0, 0.4);
  height: 10px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
}
.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
  background: #9b5cff;
  position: relative;
  box-shadow: 0 0 12px #9b5cff;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s ease-in-out infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* compact parts list */
.checks { display: flex; flex-direction: column; gap: 10px }
.check-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.2));
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  position: relative;
  transition: all 0.2s ease;
}

.check-row:hover {
  border-color: rgba(0, 212, 255, 0.2);
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.3));
}

.check-row span { color: #a8c8d8 }
.check-row strong {
  color: #e8f6ee;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.9rem;
}

.row-actions { display:flex; gap:10px; align-items:center }
.toggle-res {
  background: transparent;
  border: none;
  color: #00d4ff;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  padding: 4px 8px;
  border-radius: 6px;
}

.toggle-res:hover {
  background: rgba(0, 212, 255, 0.1);
  box-shadow: 0 0 8px rgba(0, 212, 255, 0.2);
}

/* Resource lists should also be compact — remove extra padding */
.resources {
  padding: 12px 14px;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.15));
  border-radius: 12px;
  margin-top: 10px;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.resource-row {
  padding: 8px 6px;
  display: flex;
  align-items: center;
  transition: background 0.2s ease;
  border-radius: 8px;
}

.resource-row:hover {
  background: rgba(0, 212, 255, 0.05);
}

.resource-row label { color: #d6eede; font-weight: 500 }
.resource-row small { color: #7a9ca8; margin-left: 8px }

/* hover affordance */
.card {
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}
.card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 212, 255, 0.15);
  border-color: rgba(0, 212, 255, 0.4);
}

/* collected state */
.card.collected {
  background: linear-gradient(135deg, rgba(0, 180, 100, 0.2), rgba(0, 120, 80, 0.15)) !important;
  border-color: rgba(0, 255, 136, 0.5) !important;
  color: #eafff5 !important;
  box-shadow: 0 8px 30px rgba(0, 255, 136, 0.15), inset 0 1px 0 rgba(0, 255, 136, 0.1) !important;
}

.card.collected .progress-fill {
  background: #00ff88;
  box-shadow: 0 0 16px rgba(0, 255, 136, 0.5);
}

.card.collected .badge {
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 255, 136, 0.1));
  color: #00ff88;
  border-color: rgba(0, 255, 136, 0.4);
  box-shadow: 0 0 12px rgba(0, 255, 136, 0.3);
}

.card.collected .type-top {
  color: #00ff88;
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.4);
}

.card.collected .thumb::before {
  border-color: rgba(0, 255, 136, 0.4);
}

/* Gold state: mastered items */
.card.gold {
  border: 2px solid rgba(255, 215, 64, 1) !important;
  background: linear-gradient(135deg, rgba(60, 50, 20, 0.95), rgba(40, 35, 20, 0.9)) !important;
  box-shadow: 0 16px 40px rgba(255, 200, 60, 0.2), inset 0 1px 0 rgba(255, 215, 64, 0.2) !important;
  color: #fff !important;
}

.card.gold .progress-fill {
  background: #ffd700;
  box-shadow: 0 0 16px rgba(255, 215, 64, 0.6);
}

.card.gold .thumb::before {
  border-color: rgba(255, 215, 64, 0.7);
  animation: pulse-border 1.5s ease-in-out infinite;
}

.card.gold .thumb-img {
  box-shadow: 0 6px 16px rgba(255, 200, 60, 0.4);
  border: 2px solid rgba(255, 215, 64, 0.5);
}

.card.gold .type-top {
  color: #ffd700;
  text-shadow: 0 0 16px rgba(255, 215, 64, 0.6);
}

.card.gold .badge {
  color: #ffd700;
  border-color: rgba(255, 215, 64, 0.6);
  background: linear-gradient(135deg, rgba(255, 215, 64, 0.25), rgba(255, 200, 60, 0.15));
  box-shadow: 0 0 16px rgba(255, 215, 64, 0.4);
}

.card.gold:hover {
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7), 0 0 40px rgba(255, 215, 64, 0.35);
  border-color: rgba(255, 215, 64, 1);
}

/* Relic styling */
.relic-row {
  background: linear-gradient(135deg, rgba(155, 92, 255, 0.1), rgba(155, 92, 255, 0.05));
  border: 1px solid rgba(155, 92, 255, 0.2);
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 8px;
}

.relic-main {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.relic-name {
  color: #d6c8ff;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.85rem;
}

.relic-badge {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #fff;
  box-shadow: 0 0 8px currentColor;
}

.relic-versions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.relic-version {
  background: rgba(255, 255, 255, 0.08);
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  color: #a8c8d8;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Tech corner decorations */
.card::before {
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}

/* Corner accent lines */
.card::after {
  content: '';
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  bottom: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  pointer-events: none;
  z-index: 1;
}

.part-left .small { font-size:0.85rem; color:#9fb8a6 }
.bp-title { margin-top:8px; font-weight:600 }
</style>
