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

// group by category -> subcategory -> list
const grouped = computed(() => {
  const out: Record<string, Record<string, Companion[]>> = {}
  for (const c of companionsAll.value) {
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
.sub-title { margin: 8px 0; font-size: 1rem }
.grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px }
.companion-card { background: rgba(255,255,255,0.03); padding: 12px; border-radius: 10px; color: #e8f7ee }
.card-title { font-weight: 700; margin-bottom:6px }
.card-meta { font-size: 0.9rem; opacity:0.85 }
.card-parts { margin-top:8px; font-size:0.85rem }
.card-parts ul { margin:6px 0 0 16px }
.card-actions { display:flex; gap:8px; margin-top:8px; align-items:center }
.action-item { display:flex; gap:6px; align-items:center; font-size:0.85rem }
.action-item input { width:16px; height:16px }
.subgroups { display:flex; flex-direction:column; gap:12px }
.subgroup { margin-bottom: 12px }

.part-name { font-weight:600 }
.part-meta { margin-left:6px; margin-top:4px; color:#9fb8a6; font-size:0.85rem; display:flex; flex-direction:column; gap:2px }
.part-qty { font-weight:700; color: #cfe8d6 }
.part-chance { opacity:0.9 }

</style>
