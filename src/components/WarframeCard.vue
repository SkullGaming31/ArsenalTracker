<template>
  <div :class="['card', 'p-card', 'theme-card', { collected: isFullyCollected, prime: isPrime }]" ref="root" :data-testid="testId">
    <div class="top-accent" :style="{ background: accentColor }" aria-hidden="true"></div>
    <div class="card-header">
      <div class="accent" :style="{ background: accentColor }"></div>

      <div class="thumb">
        <img v-if="imgSrc" :src="imgSrc" :alt="warframe.name || 'thumbnail'" class="thumb-img" />
        <img v-else :alt="warframe.name || 'placeholder'" src="/icons/icon-192.svg" class="thumb-img" />
      </div>

      <div class="title">
        <h3 v-html="highlightedName"></h3>
        <div class="meta">
          <span class="badge theme-badge">{{ typeParts[0] }}</span>
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
        <div class="progress-fill" :style="{ width: progressPercent + '%', background: accentColor }"></div>
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
        <span>Chassis: {{ chassisCollected ? 'true' : 'false' }}</span>
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
        <span>Systems: {{ systemsCollected ? 'true' : 'false' }}</span>
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
        <span>Blueprint: {{ blueprintCollected ? 'true' : 'false' }}</span>
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
        <span>Mastered: {{ isMastered ? 'true' : 'false' }}</span>
        <input type="checkbox" v-model="isMastered" />
      </div>
    </div>
  </div>
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
import { ref, watch, computed, toRef, watchEffect } from "vue";
import { onMounted, onBeforeUnmount } from "vue";
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
let manifestCache: any = null;
const root = ref<HTMLElement | null>(null)

async function loadAssetsManifest() {
  if (manifestCache) return manifestCache;
  try {
    const res = await fetch("/assets/manifest.api.json");
    if (!res.ok) return (manifestCache = { warframes: {}, weapons: {} });
    const json = await res.json();
    manifestCache = json || { warframes: {}, weapons: {} };
    return manifestCache;
  } catch (e) {
    manifestCache = { warframes: {}, weapons: {} };
    return manifestCache;
  }
}

function startObserving(el: Element | null) {

  // start observing the element for lazy-load
  if (!el || typeof IntersectionObserver === "undefined") return;
  observer = new IntersectionObserver(
    async (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          // attempt to load thumbnail from manifest
          const m = (await loadAssetsManifest()) || { warframes: {} };
          const name = String(warframe.value?.name || "");
          const wf = (m as any).warframes && (m as any).warframes[name];
          if (wf && wf.imageName) {
            const localPath = `/assets/${wf.imageName}`;
            try {
              const head = await fetch(localPath, { method: "HEAD" });
              if (head.ok) {
                imgSrc.value = localPath;
              } else if (wf.wikiaThumbnail) {
                imgSrc.value = wf.wikiaThumbnail;
              } else if (warframe.value && (warframe.value as any).wikiaThumbnail) {
                imgSrc.value = (warframe.value as any).wikiaThumbnail;
              }
            } catch (e) {
              if (wf.wikiaThumbnail) imgSrc.value = wf.wikiaThumbnail;
              else if (warframe.value && (warframe.value as any).wikiaThumbnail)
                imgSrc.value = (warframe.value as any).wikiaThumbnail;
            }
          } else if (wf && wf.wikiaThumbnail) {
            imgSrc.value = wf.wikiaThumbnail;
          } else if (warframe.value && (warframe.value as any).wikiaThumbnail) {
            imgSrc.value = (warframe.value as any).wikiaThumbnail;
          }
          // stop observing once attempted
          if (observer) {
            observer.disconnect();
            observer = null;
          }
        }
      }
    },
    { rootMargin: "200px" },
  );
  observer.observe(el);
}

onMounted(() => {
  startObserving(root.value);

  // fallback: if after a short delay no local image was set, use the remote wiki thumbnail
  setTimeout(async () => {
    if (imgSrc.value) return
    try {
      const m = await loadAssetsManifest()
      const name = String(warframe.value?.name || '')
      const wf = (m as any).warframes && (m as any).warframes[name]
      if (wf && wf.wikiaThumbnail) imgSrc.value = wf.wikiaThumbnail
      else if (warframe.value && (warframe.value as any).wikiaThumbnail) imgSrc.value = (warframe.value as any).wikiaThumbnail
    } catch (e) {
      if (warframe.value && (warframe.value as any).wikiaThumbnail) imgSrc.value = (warframe.value as any).wikiaThumbnail
    }
  }, 400)
});

onBeforeUnmount(() => {
  if (observer) observer.disconnect();
});

// initialize local state when `warframe` prop arrives/changes
watchEffect(() => {
  const w = warframe.value || ({} as Warframe);
  neuropticsCollected.value = Boolean(w.neuroptics_collected);
  chassisCollected.value = Boolean(w.chassis_collected);
  systemsCollected.value = Boolean(w.systems_collected);
  blueprintCollected.value = Boolean(w.blueprint_collected);
  isMastered.value = Boolean(w.is_mastered);

  neuropticsResources.value = (w.neuroptics_resources || []).map((r) => ({ ...r }));
  chassisResources.value = (w.chassis_resources || []).map((r) => ({ ...r }));
  systemsResources.value = (w.systems_resources || []).map((r) => ({ ...r }));
  blueprintResources.value = (w.blueprint_resources || []).map((r) => ({ ...r }));
});

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
  { deep: true, flush: "sync" },
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

// simple accent color per type (prime vs non-prime)
const accentColor = computed(() =>
  String(warframe.value?.type || "")
    .toLowerCase()
    .includes("prime")
    ? "var(--accent-purple)"
    : "var(--accent-green)",
);

// split type into up to two parts for top/bottom display
const typeParts = computed(() => {
  let raw = String(warframe.value?.type || "");
  // normalize common non-prime forms so they remain a single token
  raw = raw.replace(/\bnon[-\s]*prime\b/gi, (m) => m.replace(/\s+/g, "-"));
  // common delimiters between types; we've already normalized non-prime so it won't split on '-'
  const parts = raw.split(/\s*[|,\\\+]\s*|\s+and\s+/i).filter(Boolean);
  if (parts.length === 0) return [""];
  if (parts.length === 1) return [parts[0]];
  // if more than 2, show first as top and rest joined as bottom
  return [parts[0], parts.slice(1).join(" / ")];
});

// whether the warframe is a Prime variant (type string contains 'prime')
const isPrime = computed(() => String(warframe.value?.type || "").toLowerCase().includes("prime"));

// highlightedName: if props.highlight provided, wrap the first occurrence in a <mark>
const highlightedName = computed(() => {
  const name = String(warframe.value?.name || "");
  const hl = (props as any).highlight || "";
  if (!hl) return name;
  try {
    const idx = name.toLowerCase().indexOf(String(hl).toLowerCase());
    if (idx === -1) return name;
    const before = name.slice(0, idx);
    const match = name.slice(idx, idx + hl.length);
    const after = name.slice(idx + hl.length);
    return `${before}<mark>${match}</mark>${after}`;
  } catch (e) {
    return name;
  }
});

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

.card-header {
  gap: 10px;
}
.thumb {
  width: 64px;
  flex: 0 0 64px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.thumb-img {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 8px;
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
  background: rgba(0,0,0,0.25);
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.78rem;
  color: var(--accent-gold);
  border: 1px solid rgba(255,255,255,0.02);
  box-shadow: 0 2px 0 rgba(255,255,255,0.01) inset;
}

.crafted {
  font-size: 0.8rem;
  color: #ddd;
}

.progress {
  margin: 8px 0 12px 0;
}
.progress-bar {
  background: rgba(255, 255, 255, 0.03);
  height: 8px;
  border-radius: 6px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  transition: width 0.25s ease;
}

.checks {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.check-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: rgba(0,0,0,0.25);
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.02);
}
.check-row span { color: var(--muted) }

.row-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}
.toggle-res {
  background: transparent;
  border: none;
  color: #9fb8a6;
  cursor: pointer;
  font-size: 0.9rem;
}
.resources { padding: 10px 12px; background: rgba(0,0,0,0.12); border-radius: 10px; margin-top: 8px }
.resource-row {
  padding: 6px 4px;
  display: flex;
  align-items: center;
}
.resource-row label {
  color: #d6eede;
}
.resource-row small {
  color: #9fb8a6;
  margin-left: 8px;
}

.card {
  transition: transform .12s ease, box-shadow .12s ease;
}
.card:hover { transform: translateY(-6px); box-shadow: 0 12px 40px rgba(2,6,23,0.6) }

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
  background: rgba(255, 255, 255, 0.06) !important;
  color: #ffd54a !important;
}

/* collected state */
.card.collected {
  background: linear-gradient(180deg, rgba(43,166,95,0.18), rgba(43,166,95,0.10)) !important;
  border-color: rgba(43,166,95,0.35) !important;
  color: #eafaf0 !important;
  box-shadow: 0 8px 24px rgba(43,166,95,0.08) !important;
}

/* Prime variant styling: gold border and subtle glow */
.card.prime {
  border: 1px solid rgba(255, 215, 64, 1);
  box-shadow: 0 8px 28px rgba(255, 200, 60, 0.10);
}
.card.prime .badge {
  color: #ffd54a;
  border-color: rgba(255,215,64,0.08);
}
/* Make the top accent and vertical accent gold on prime cards */
.card.prime .top-accent {
  background: linear-gradient(90deg, rgba(255,215,64,1), rgba(255,200,60,0.9));
}
.card.prime .accent {
  background: linear-gradient(180deg, rgba(255,215,64,0.95), rgba(255,200,60,0.7));
}
.card.prime .thumb-img {
  box-shadow: 0 2px 8px rgba(255, 200, 60, 0.06);
  border: 1px solid rgba(255,215,64,0.06);
}
</style>
