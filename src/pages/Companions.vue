<template>
  <div class="companions">
    <section class="section" v-for="(submap, category) in grouped" :key="category">
      <h3>{{ categoryLabel(category) }}</h3>
      <div class="subgroups">
        <div v-for="(list, sub) in submap" :key="sub" class="subgroup">
          <h4 class="sub-title">{{ sub }}</h4>
          <div class="grid">
            <div v-for="c in list" :key="c.name" class="card-wrap">
              <div class="companion-card">
                <div class="card-title">{{ c.name }}</div>
                <div class="card-meta">Type: {{ c.type }}</div>
                <div class="card-actions">
                  <label class="action-item">
                    <input type="checkbox" :checked="!!c.mastered" @change="onMasteredChange(c, $event)" />
                    <span>Mastered</span>
                  </label>
                </div>
                <div v-if="c.parts && c.parts.length" class="card-parts">
                  <strong>Parts:</strong>
                  <ul>
                      <li v-for="(p, i) in c.parts" :key="i">
                        <div class="part-name">{{ p.item || p.name || p.description || 'unknown' }}</div>
                        <div class="part-meta">
                          <div v-if="p.source" class="part-source">Source: {{ p.source }}</div>
                          <div v-if="p.chance" class="part-chance">Chance: {{ p.chance }}</div>
                        </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'CompanionsPage' })
import { computed } from 'vue'
import { useCollectionStore } from '../stores/collection'
import type { Companion } from '../types/companion'

const { setOverride } = useCollectionStore()

function setMastered(c: Companion, val: boolean) {
  setOverride(c.name || '', { mastered: val })
}

function onMasteredChange(c: Companion, e: Event) {
  const el = e.target as HTMLInputElement | null
  const checked = el?.checked ?? false
  setMastered(c, checked)
}

const collection = useCollectionStore()
const companionsAll = computed<Companion[]>(() => collection.mergedCompanions as Companion[])

const props = defineProps<{ query?: string; hideCompleted?: boolean }>()
const hideCompleted = computed(() => Boolean(props.hideCompleted))

// helper to coerce various flag shapes into booleans
const flagTrue = (v: unknown): boolean => {
  if (v === true) return true
  if (v === false) return false
  if (typeof v === 'string') return v.toLowerCase() === 'true'
  if (typeof v === 'number') return v !== 0
  return Boolean(v)
}

function isCompanionCompleted(c: Companion) {
  // require mastery and all parts collected (if any)
  if (!flagTrue((c as unknown as Record<string, unknown>).mastered)) return false
  const parts = (c.parts || []) as unknown[]
  if (parts.length === 0) return true
  return parts.every(p => flagTrue((p && (p as unknown as Record<string, unknown>).collected)))
}

// group by category -> subcategory -> list
const grouped = computed(() => {
  const out: Record<string, Record<string, Companion[]>> = {}
  const source = companionsAll.value.filter(c => !hideCompleted.value || !isCompanionCompleted(c))
  for (const c of source) {
    const cat = String(c.category || 'uncategorized')
    const sub = String(c.subcategory || c.type || 'General')
    out[cat] = out[cat] || {}
    out[cat][sub] = out[cat][sub] || []
    out[cat][sub].push(c)
  }
  // sort lists by name
  for (const cat of Object.keys(out)) {
    const submap = out[cat]
    if (!submap) continue
    for (const sub of Object.keys(submap)) {
      const list = submap[sub]
      if (!list) continue
      list.sort((a,b)=> (a.name||'').localeCompare(b.name||''))
    }
  }
  return out
})

function categoryLabel(cat: string) {
  switch (cat) {
    case 'robotics': return 'Robotics'
    case 'beasts': return 'Beasts'
    case 'deimos': return 'Deimos Infested Beasts'
    case 'uncategorized': return 'Uncategorized'
    default: return cat
  }
}
</script>

<style scoped>
.companions { max-width: 1100px; margin: 0 auto; padding: 24px 16px }
.sub-title { margin: 8px 0; font-size: 1rem; text-transform: uppercase; letter-spacing: 0.05em; color: #00d4ff; text-shadow: 0 0 10px rgba(0, 212, 255, 0.3); }
.grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px }
.companion-card {
  background: linear-gradient(135deg, rgba(10, 20, 30, 0.95), rgba(20, 35, 50, 0.9));
  padding: 16px;
  border-radius: 12px;
  color: #e8f7ee;
  border: 1px solid #2a4a5a;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.companion-card::before {
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

.companion-card::after {
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

.companion-card > * {
  position: relative;
  z-index: 2;
}

.companion-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 212, 255, 0.15);
  border-color: rgba(0, 212, 255, 0.4);
}

.card-title {
  font-weight: 700;
  margin-bottom: 8px;
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #e8f6ee;
  text-shadow: 0 0 8px rgba(0, 212, 255, 0.2);
}

.card-meta {
  font-size: 0.9rem;
  opacity: 0.85;
  color: #a8c8d8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.card-parts {
  margin-top: 12px;
  font-size: 0.85rem;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.15));
  border-radius: 12px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.card-parts ul {
  margin: 8px 0 0 16px;
  color: #d6eede;
}

.card-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.action-item {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 0.85rem;
  color: #a8c8d8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
}

.action-item input {
  width: 18px;
  height: 18px;
  accent-color: #00d4ff;
}

.subgroups { display:flex; flex-direction:column; gap:12px }
.subgroup { margin-bottom: 12px }

.part-name {
  font-weight: 600;
  color: #e8f6ee;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.part-meta {
  margin-left: 6px;
  margin-top: 4px;
  color: #9fb8a6;
  font-size: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.part-qty { font-weight: 700; color: #cfe8d6 }
.part-chance { opacity: 0.9 }

</style>
