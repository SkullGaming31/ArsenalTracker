<template>
  <q-card :class="['card', 'theme-card', { collected: isFullyCollected, prime: isPrime, gold: isGold }]" ref="root" :data-testid="testId">
    
      <div class="top-accent" :style="{ background: accentColor }" aria-hidden="true"></div>
      <div class="card-header">
        <div class="accent" :style="{ background: accentColor }"></div>

        <div class="thumb">
          <img v-if="imgSrc" :src="imgSrc" :alt="warframe.name || 'thumbnail'" class="thumb-img" loading="lazy" @error="onImgError" />
          <img v-else :alt="warframe.name || 'placeholder'" src="/icons/icon-192.svg" class="thumb-img" loading="lazy" />
        </div>

        <div class="title">
          <!-- render plain text when no highlight is requested to avoid v-html oddities; use highlighted html only when highlight present -->
          <h3 v-if="!props.highlight">
            <a :href="wikiUrl(displayedName)" target="_blank" rel="noopener noreferrer">{{ displayedName }}</a>
          </h3>
          <h3 v-else>
            <a :href="wikiUrl(displayedName)" target="_blank" rel="noopener noreferrer">
              <span v-for="(p, i) in nameParts" :key="i">
                <mark v-if="p.match">{{ p.text }}</mark>
                <template v-else>{{ p.text }}</template>
              </span>
            </a>
          </h3>
    <!-- name probe removed (debug) -->
          <div class="meta">
            <span class="badge theme-badge">{{ typeParts[0] }}</span>
            <span class="crafted">{{ craftedCount }}/4 crafted</span>
          </div>
        </div>
      </div>

    
      <!-- debug JSON removed: no longer displayed on card -->

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
        <div class="check-row">
          <span>Neuroptics:</span>
          <div class="row-actions">
            <input type="checkbox" v-model="neuropticsCollected" />
            <button class="toggle-res" @click="showNeuroptics = !showNeuroptics">▾</button>
          </div>
        </div>

        <div class="resources" v-if="showNeuroptics">
          <div v-for="(r, idx) in neuropticsResources" :key="r.name + idx" class="resource-row" :class="{ collected: r.collected }">
            <label>
              <input type="checkbox" v-model="r.collected" />
              <span class="res-icon icon-neuro" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><circle cx="12" cy="8" r="3"/><path d="M12 11v6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" fill="none"/></svg>
              </span>
              {{ r.name }} <small>×{{ r.quantity }}</small>
            </label>
          </div>
        </div>

        <div class="check-row">
          <span>Chassis:</span>
          <div class="row-actions">
            <input type="checkbox" v-model="chassisCollected" />
            <button class="toggle-res" @click="showChassis = !showChassis">▾</button>
          </div>
        </div>

        <div class="resources" v-if="showChassis">
          <div v-for="(r, idx) in chassisResources" :key="r.name + idx" class="resource-row" :class="{ collected: r.collected }">
            <label>
              <input type="checkbox" v-model="r.collected" />
              <span class="res-icon icon-gear" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M12 8a4 4 0 100 8 4 4 0 000-8z"/><path d="M2 12h2m16 0h2M12 2v2m0 16v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
              </span>
              {{ r.name }} <small>×{{ r.quantity }}</small>
            </label>
          </div>
        </div>

        <div class="check-row">
          <span>Systems:</span>
          <div class="row-actions">
            <input type="checkbox" v-model="systemsCollected" />
            <button class="toggle-res" @click="showSystems = !showSystems">▾</button>
          </div>
        </div>

        <div class="resources" v-if="showSystems">
          <div v-for="(r, idx) in systemsResources" :key="r.name + idx" class="resource-row" :class="{ collected: r.collected }">
            <label>
              <input type="checkbox" v-model="r.collected" />
              <span class="res-icon icon-bolt" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M13 2L3 14h7l-1 8 10-12h-7z"/></svg>
              </span>
              {{ r.name }} <small>×{{ r.quantity }}</small>
            </label>
          </div>
        </div>

        <div class="check-row">
          <span>Blueprint:</span>
          <div class="row-actions">
            <input type="checkbox" v-model="blueprintCollected" />
            <button class="toggle-res" @click="showBlueprint = !showBlueprint">▾</button>
          </div>
        </div>

        <div class="resources" v-if="showBlueprint">
          <div v-for="(r, idx) in blueprintResources" :key="r.name + idx" class="resource-row" :class="{ collected: r.collected }">
            <label>
              <input type="checkbox" v-model="r.collected" />
              <span class="res-icon icon-doc" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><rect x="4" y="3" width="12" height="18" rx="2"/><path d="M8 7h6M8 11h6M8 15h4" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
              </span>
              {{ r.name }} <small>×{{ r.quantity }}</small>
            </label>
          </div>
        </div>

        <div class="check-row">
          <span>Mastered:</span>
          <input
            type="checkbox"
            v-model="isMastered"
            :disabled="!isAllPartsCollected"
            :title="isAllPartsCollected ? 'Mark mastered' : 'Collect all parts to enable mastery'"
            @change="onMasterChange"
          />
        </div>
      </div>
  </q-card>
</template>

<script lang="ts" setup>
import type { Warframe, Resource } from "../types/warframe";

const props = defineProps<{ warframe: Warframe; highlight?: string }>();
type WarframeUpdate = {
  name: string;
  neuroptics_collected: boolean;
  chassis_collected: boolean;
  systems_collected: boolean;
  blueprint_collected: boolean;
  is_mastered: boolean;
  neuroptics_resources?: Resource[];
  chassis_resources?: Resource[];
  systems_resources?: Resource[];
  blueprint_resources?: Resource[];
};
const emit = defineEmits<{ (e: "update", payload: WarframeUpdate): void }>();
// keep `warframe` as a reactive ref so updates from parent propagate
import { ref, watch, computed, toRef } from "vue";
import { onMounted, onBeforeUnmount } from "vue";
import type { ComponentPublicInstance } from 'vue'
import { probeImage } from '../lib/imageProbe'
const warframe = toRef(props as { warframe: Warframe }, "warframe");

const testId = computed(() => {
  const name = String(warframe.value?.name || '')
  return 'card-' + name.replace(/\s+/g, '-').toLowerCase()
})

// local reactive copies so checkboxes can be toggled (props are readonly)
const neuropticsCollected = ref(false);
const chassisCollected = ref(false);
const systemsCollected = ref(false);
const blueprintCollected = ref(false);
const isMastered = ref(false);

// local resource arrays (cloned so we can mutate locally)
const neuropticsResources = ref<Resource[]>([]);
const chassisResources = ref<Resource[]>([]);
const systemsResources = ref<Resource[]>([]);
const blueprintResources = ref<Resource[]>([]);

// toggles for showing resource lists
const showNeuroptics = ref(false);
const showChassis = ref(false);
const showSystems = ref(false);
const showBlueprint = ref(false);

// thumbnail state
const imgSrc = ref<string | null>(null);
let observer: IntersectionObserver | null = null;

interface AssetsManifest {
  warframes?: Record<string, { imageName?: string; wikiaThumbnail?: string }>;
  weapons?: Record<string, unknown>;
}

let manifestCache: AssetsManifest | null = null;
const root = ref<Element | ComponentPublicInstance | null>(null)
const _failedImgUrls = new Set<string>()

async function findCdn(n: string, imageName?: string) {
  const candidates: string[] = []
  if (imageName) candidates.push(`https://cdn.warframestat.us/img/${encodeURIComponent(imageName)}`)
  const nameSlug = encodeURIComponent(n.replace(/\s+/g, '-').toLowerCase())
  candidates.push(`https://cdn.warframestat.us/img/${nameSlug}.png`)
  if (n.includes('&')) candidates.push(`https://cdn.warframestat.us/img/${encodeURIComponent(n.replace(/&/g, 'and').replace(/\s+/g, '-').toLowerCase())}.png`)
  for (const cdnUrl of candidates) {
    try {
      const ok = await probeImage(cdnUrl)
      if (ok) return cdnUrl
    } catch {
      // ignore and try next
    }
  }
  return null
}

async function onImgError(e: Event) {
  try {
    const img = e.target as HTMLImageElement | null
    if (!img) return
    const src = img.currentSrc || img.src
    if (!src) return
    if (_failedImgUrls.has(src)) {
      // already tried this URL, stop and show placeholder
      imgSrc.value = null
      return
    }
    _failedImgUrls.add(src)

    // attempt fallbacks: manifest wikiaThumbnail, CDN probe
    const m = await loadAssetsManifest()
    const name = String(warframe.value?.name || '')
    const wf = m.warframes ? m.warframes[name] : undefined
    if (wf && wf.wikiaThumbnail && wf.wikiaThumbnail !== src) {
      imgSrc.value = wf.wikiaThumbnail
      return
    }
    if (getWikiaThumbnail(warframe.value) && getWikiaThumbnail(warframe.value) !== src) {
      imgSrc.value = getWikiaThumbnail(warframe.value)!
      return
    }
    // try CDN candidates
  const cdn = await findCdn(name, wf && wf.imageName)
    if (cdn && cdn !== src) {
      imgSrc.value = cdn
      return
    }

    // no fallback found; clear to show placeholder
    imgSrc.value = null
  } catch {
    imgSrc.value = null
  }
}

async function loadAssetsManifest(): Promise<AssetsManifest> {
  if (manifestCache) return manifestCache;
  try {
    const res = await fetch('/assets/manifest.api.json');
    if (!res.ok) return (manifestCache = { warframes: {}, weapons: {} });
    const json = await res.json();
    manifestCache = (json || { warframes: {}, weapons: {} }) as AssetsManifest;
    return manifestCache;
  } catch {
    manifestCache = { warframes: {}, weapons: {} };
    return manifestCache;
  }
}

function getWikiaThumbnail(wf?: Warframe | null): string | undefined {
  if (!wf) return undefined
  const meta = wf as unknown as { wikiaThumbnail?: unknown }
  return typeof meta.wikiaThumbnail === 'string' ? meta.wikiaThumbnail : undefined
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

// image probing is handled by src/lib/imageProbe.ts which throttles concurrent Image loads

function startObserving(el: Element | ComponentPublicInstance | null) {

  // resolve potential component ref to underlying DOM element
  const target: Element | null = (el instanceof Element) ? el : (el && (el as ComponentPublicInstance).$el) ? (el as ComponentPublicInstance).$el : null

  // start observing the element for lazy-load
  if (!target || typeof IntersectionObserver === "undefined") return;

  // Find the nearest scrollable ancestor and use it as the observer root so
  // intersection checks work correctly when cards are inside a scrolling
  // container (our virtual scroller). Fallback to viewport when none found.
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

  const root = findScrollParent(target) || null

  observer = new IntersectionObserver(
    async (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;

  // attempt to load thumbnail from manifest
  const m = await loadAssetsManifest();
  const name = String(warframe.value?.name || '');
  const wf = m.warframes ? m.warframes[name] : undefined;

        // Use shared findCdn helper to probe CDN candidates

        if (wf && wf.imageName) {
          const localPath = `/assets/${wf.imageName}`;
          try {
            const head = await fetch(localPath, { method: 'HEAD' });
            if (head.ok) {
              imgSrc.value = localPath;
            } else if (wf.wikiaThumbnail) {
              imgSrc.value = wf.wikiaThumbnail;
            } else {
              const cdnLocal = await findCdn(name, wf.imageName);
              if (cdnLocal) imgSrc.value = cdnLocal;
              else if (getWikiaThumbnail(warframe.value)) imgSrc.value = getWikiaThumbnail(warframe.value)!;
            }
          } catch {
            if (wf.wikiaThumbnail) imgSrc.value = wf.wikiaThumbnail;
            else if (getWikiaThumbnail(warframe.value)) imgSrc.value = getWikiaThumbnail(warframe.value)!;
          }
        } else if (wf && wf.wikiaThumbnail) {
          imgSrc.value = wf.wikiaThumbnail;
        } else if (getWikiaThumbnail(warframe.value)) {
          imgSrc.value = getWikiaThumbnail(warframe.value)!;
        } else {
          // final fallback: try CDN directly for the warframe name (no local imageName available)
          const cdn = await findCdn(name);
          if (cdn) imgSrc.value = cdn;
        }

        // stop observing once attempted
        if (observer) {
          observer.disconnect();
          observer = null;
        }
      }
    },
    { root, rootMargin: '200px' },
  );
  observer.observe(target);
}

onMounted(() => {
  startObserving(root.value);

  // fallback: if after a short delay no local image was set, use the remote wiki thumbnail
  setTimeout(async () => {
    if (imgSrc.value) return
    try {
      const m = await loadAssetsManifest()
      const name = String(warframe.value?.name || '')
      const wf = m.warframes ? m.warframes[name] : undefined
      if (wf && wf.wikiaThumbnail) imgSrc.value = wf.wikiaThumbnail
      else if (getWikiaThumbnail(warframe.value)) imgSrc.value = getWikiaThumbnail(warframe.value)!
      else {
        // try warframestat CDN as a final fallback
          try {
          const nameSlug = encodeURIComponent(name.replace(/\s+/g, '-').toLowerCase())
          const cdnUrl = `https://cdn.warframestat.us/img/${nameSlug}.png`
          const head = await fetch(cdnUrl, { method: 'HEAD' })
          if (head.ok) imgSrc.value = cdnUrl
          } catch {
          // ignore
        }
      }
      } catch {
        if (getWikiaThumbnail(warframe.value)) imgSrc.value = getWikiaThumbnail(warframe.value)!
      }
  }, 400)
});

onBeforeUnmount(() => {
  if (observer) observer.disconnect();
});

// initialize local state when `warframe` prop arrives/changes
// Use per-field watchers instead of a broad watchEffect so unrelated prop updates
// (e.g. other warframe overrides) don't cause every card to re-clone data and run
// expensive operations. This prevents UI freezes when many cards are rendered.
watch(
  () => warframe.value && warframe.value.neuroptics_collected,
  (v) => (neuropticsCollected.value = Boolean(v)),
  { immediate: true }
);
watch(
  () => warframe.value && warframe.value.chassis_collected,
  (v) => (chassisCollected.value = Boolean(v)),
  { immediate: true }
);
watch(
  () => warframe.value && warframe.value.systems_collected,
  (v) => (systemsCollected.value = Boolean(v)),
  { immediate: true }
);
watch(
  () => warframe.value && warframe.value.blueprint_collected,
  (v) => (blueprintCollected.value = Boolean(v)),
  { immediate: true }
);
watch(
  () => warframe.value && warframe.value.is_mastered,
  (v) => (isMastered.value = Boolean(v)),
  { immediate: true }
);

watch(
  () => (warframe.value && warframe.value.neuroptics_resources) || [],
  (v) => (neuropticsResources.value = (v || []).map((r: Resource) => ({ ...r }))),
  { immediate: true }
);
watch(
  () => (warframe.value && warframe.value.chassis_resources) || [],
  (v) => (chassisResources.value = (v || []).map((r: Resource) => ({ ...r }))),
  { immediate: true }
);
watch(
  () => (warframe.value && warframe.value.systems_resources) || [],
  (v) => (systemsResources.value = (v || []).map((r: Resource) => ({ ...r }))),
  { immediate: true }
);
watch(
  () => (warframe.value && warframe.value.blueprint_resources) || [],
  (v) => (blueprintResources.value = (v || []).map((r: Resource) => ({ ...r }))),
  { immediate: true }
);

// when any toggle changes, emit an update with the new state (parent can listen)
watch(
  [
    neuropticsCollected,
    chassisCollected,
    systemsCollected,
    blueprintCollected,
    isMastered,
    neuropticsResources,
    chassisResources,
    systemsResources,
    blueprintResources,
  ],
  () => {
    emit("update", {
      name: warframe.value?.name || "",
      neuroptics_collected: neuropticsCollected.value,
      chassis_collected: chassisCollected.value,
      systems_collected: systemsCollected.value,
      blueprint_collected: blueprintCollected.value,
      is_mastered: isMastered.value,
      neuroptics_resources: neuropticsResources.value.map((r) => ({ ...r })),
      chassis_resources: chassisResources.value.map((r) => ({ ...r })),
      systems_resources: systemsResources.value.map((r) => ({ ...r })),
      blueprint_resources: blueprintResources.value.map((r) => ({ ...r })),
    });
  },
  { deep: true },
);

// computed visual stats
const craftedCount = computed(
  () =>
    [
      neuropticsCollected.value,
      chassisCollected.value,
      systemsCollected.value,
      blueprintCollected.value,
    ].filter(Boolean).length,
);

const progressPercent = computed(() => Math.round((craftedCount.value / 4) * 100));

// simple accent color: prefer gold when the card is gold (mastered), otherwise
// use purple for prime and green for non-prime.
const accentColor = computed(() => {
  if (isGold.value) return "var(--accent-gold)";
  return String(warframe.value?.type || "").toLowerCase().includes("prime")
    ? "var(--accent-purple)"
    : "var(--accent-green)";
});

// split type into up to two parts for top/bottom display
const typeParts = computed(() => {
  let raw = String(warframe.value?.type || "");
  // normalize common non-prime forms so they remain a single token
  raw = raw.replace(/\bnon[-\s]*prime\b/gi, (m) => m.replace(/\s+/g, "-"));
  // common delimiters between types; we've already normalized non-prime so it won't split on '-'
  const parts = raw.split(/\s*[|,\\+]\s*|\s+and\s+/i).filter(Boolean);
  if (parts.length === 0) return [""];
  if (parts.length === 1) return [parts[0]];
  // if more than 2, show first as top and rest joined as bottom
  return [parts[0], parts.slice(1).join(" / ")];
});

// whether the warframe is a Prime variant (type string contains 'prime')
const isPrime = computed(() => String(warframe.value?.type || "").toLowerCase().includes("prime"));

// nameParts: safe structure for rendering highlighted name without v-html
const nameParts = computed(() => {
  const name = String(warframe.value?.name || "");
  const hl = String(props.highlight || "").trim();
  if (!hl) return [{ text: name, match: false }];
  try {
    const lower = name.toLowerCase();
    const idx = lower.indexOf(hl.toLowerCase());
    if (idx === -1) return [{ text: name, match: false }];
    const before = name.slice(0, idx);
    const match = name.slice(idx, idx + hl.length);
    const after = name.slice(idx + hl.length);
    return [
      { text: before, match: false },
      { text: match, match: true },
      { text: after, match: false },
    ];
  } catch {
    return [{ text: name, match: false }];
  }
});

// displayedName: simple computed used by the template
const displayedName = computed(() => String(warframe.value?.name || ''));

// If all resources for a part are collected, mark that part as collected (ready to craft)
const neuropticsAllResourcesCollected = computed(
  () =>
    neuropticsResources.value.length > 0 &&
    neuropticsResources.value.every((r) => Boolean(r.collected)),
);
const chassisAllResourcesCollected = computed(
  () =>
    chassisResources.value.length > 0 && chassisResources.value.every((r) => Boolean(r.collected)),
);
const systemsAllResourcesCollected = computed(
  () =>
    systemsResources.value.length > 0 && systemsResources.value.every((r) => Boolean(r.collected)),
);
const blueprintAllResourcesCollected = computed(
  () =>
    blueprintResources.value.length > 0 &&
    blueprintResources.value.every((r) => Boolean(r.collected)),
);

// all four parts collected: either the explicit collected flag OR all resources collected for each part
const isFullyCollected = computed(() =>
  (neuropticsCollected.value || neuropticsAllResourcesCollected.value) &&
  (chassisCollected.value || chassisAllResourcesCollected.value) &&
  (systemsCollected.value || systemsAllResourcesCollected.value) &&
  (blueprintCollected.value || blueprintAllResourcesCollected.value)
)

// whether the four parts are all collected (either via explicit flag or via resources)
const isAllPartsCollected = computed(() =>
  (neuropticsCollected.value || neuropticsAllResourcesCollected.value) &&
  (chassisCollected.value || chassisAllResourcesCollected.value) &&
  (systemsCollected.value || systemsAllResourcesCollected.value) &&
  (blueprintCollected.value || blueprintAllResourcesCollected.value)
)

// gold state: show gold styling only when the item is marked mastered.
// Fully-collected items will use the 'collected' (green) styling. Mastery is a separate gold state.
const isGold = computed(() => Boolean(isMastered.value))

// debug helpers removed: no on-card JSON or automatic debug logging

watch(neuropticsAllResourcesCollected, (val) => {
  if (val && !neuropticsCollected.value) neuropticsCollected.value = true;
});
watch(chassisAllResourcesCollected, (val) => {
  if (val && !chassisCollected.value) chassisCollected.value = true;
});
watch(systemsAllResourcesCollected, (val) => {
  if (val && !systemsCollected.value) systemsCollected.value = true;
});
watch(blueprintAllResourcesCollected, (val) => {
  if (val && !blueprintCollected.value) blueprintCollected.value = true;
});

// ensure mastery cannot remain set if parts become incomplete
watch(isAllPartsCollected, (val) => {
  if (!val && isMastered.value) {
    // clear mastery to keep state consistent; emits will notify parent
    isMastered.value = false;
  }
});

function onMasterChange() {
  // If parts are not all collected, revert the change and do nothing.
  if (!isAllPartsCollected.value) {
    // revert v-model change
    isMastered.value = false
    return
  }
  // otherwise, emit will happen via the existing deep watcher that includes isMastered
}
</script>

<style scoped>
  .resources {
    margin-top: 0.5rem;
  }
  .resource-row {
    display: flex;
    align-items: center;
    padding: 0.25rem 0.25rem;
    border-radius: 6px;
  }
  .resource-row label {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
  }
  .res-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    color: var(--muted-foreground, #9aa0a6);
    flex: 0 0 20px;
  }
  .resource-row.collected .res-icon {
    color: var(--accent-green, #4caf50);
  }
  .resource-row input[type="checkbox"] {
    transform: scale(0.95);
    margin-right: 0.25rem;
  }

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

.thumb {
  width: 72px;
  flex: 0 0 72px;
  display: flex;
  align-items: center;
  justify-content: center;
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

.title {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.title h3 {
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #e8f6ee;
  text-shadow: 0 0 8px rgba(0, 212, 255, 0.2);
}

.accent {
  width: 4px;
  border-radius: 4px 0 0 4px;
  margin-right: 12px;
  position: relative;
  box-shadow: 0 0 10px currentColor;
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

.crafted {
  font-size: 0.8rem;
  color: #a8c8d8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.progress {
  margin: 12px 0;
}

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
  position: relative;
  box-shadow: 0 0 12px currentColor;
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

.checks {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

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

.check-row span {
  color: #a8c8d8;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.85rem;
}

.row-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

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

.resource-row label {
  color: #d6eede;
  font-weight: 500;
}

.resource-row small {
  color: #7a9ca8;
  margin-left: 8px;
}

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

/* Prime variant styling */
.card.prime {
  border: 2px solid rgba(255, 215, 64, 0.8);
  box-shadow: 0 8px 30px rgba(255, 200, 60, 0.15), inset 0 1px 0 rgba(255, 215, 64, 0.15);
  background: linear-gradient(135deg, rgba(40, 30, 10, 0.95), rgba(30, 25, 15, 0.9));
}

.card.prime .badge {
  color: #ffd700;
  border-color: rgba(255, 215, 64, 0.5);
  background: linear-gradient(135deg, rgba(255, 215, 64, 0.2), rgba(255, 200, 60, 0.1));
  box-shadow: 0 0 12px rgba(255, 215, 64, 0.3);
}

.card.prime .type-top {
  color: #ffd700;
  text-shadow: 0 0 12px rgba(255, 215, 64, 0.5);
}

.card.prime .top-accent {
  background: linear-gradient(90deg, rgba(255, 215, 64, 1), rgba(255, 200, 60, 0.9));
  box-shadow: 0 0 16px rgba(255, 215, 64, 0.6);
}

.card.prime .accent {
  background: linear-gradient(180deg, rgba(255, 215, 64, 0.95), rgba(255, 200, 60, 0.7));
  box-shadow: 0 0 12px rgba(255, 215, 64, 0.5);
}

.card.prime .thumb::before {
  border-color: rgba(255, 215, 64, 0.5);
  animation: pulse-border 2s ease-in-out infinite;
}

.card.prime .thumb-img {
  box-shadow: 0 4px 12px rgba(255, 200, 60, 0.3);
  border: 2px solid rgba(255, 215, 64, 0.3);
}

.card.prime:hover {
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(255, 215, 64, 0.25);
  border-color: rgba(255, 215, 64, 1);
}

/* Gold state: mastered items */
.card.gold {
  border: 2px solid rgba(255, 215, 64, 1) !important;
  background: linear-gradient(135deg, rgba(60, 50, 20, 0.95), rgba(40, 35, 20, 0.9)) !important;
  box-shadow: 0 16px 40px rgba(255, 200, 60, 0.2), inset 0 1px 0 rgba(255, 215, 64, 0.2) !important;
  color: #fff !important;
}

.card.gold .top-accent {
  background: linear-gradient(90deg, rgba(255, 215, 64, 1), rgba(255, 200, 60, 0.95));
  box-shadow: 0 0 20px rgba(255, 215, 64, 0.7);
}

.card.gold .accent {
  background: linear-gradient(180deg, rgba(255, 215, 64, 0.95), rgba(255, 200, 60, 0.8));
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
</style>
