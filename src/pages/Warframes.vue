<template>
  <div class="warframes">
    <h2>Warframes</h2>
    <div class="toolbar">
      <input v-model="query" placeholder="Search warframes..." class="search" />
    </div>
    <section class="section">
      <h3>Prime</h3>
      <div class="grid">
        <WarframeCard v-for="w in filteredPrimeWarframes" :key="w.name" :warframe="w" @update="handleUpdate" />
      </div>
    </section>

    <section class="section">
      <h3>Non-Prime</h3>
      <div class="grid">
        <WarframeCard v-for="w in filteredNonPrimeWarframes" :key="w.name" :warframe="w" @update="handleUpdate" />
      </div>
    </section>
    
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import WarframeCard from '../components/WarframeCard.vue'
import { useCollectionStore } from '../stores/collection'
import type { Warframe } from '../types/warframe'

const collection = useCollectionStore()
const query = ref<string>('')

const warframesAll = computed<Warframe[]>(() => collection.mergedWarframes as Warframe[])

const primeWarframes = computed<Warframe[]>(() =>
  warframesAll.value.filter((w: Warframe) => {
    const t = String(w.type || '').toLowerCase()
    const nonPrimeRegex = /\bnon[-\s]*prime\b|\bnonprime\b/
    if (nonPrimeRegex.test(t)) return false
    return /\bprime\b/.test(t)
  })
)

const nonPrimeWarframes = computed<Warframe[]>(() =>
  warframesAll.value.filter((w: Warframe) => {
    const t = String(w.type || '').toLowerCase()
    const nonPrimeRegex = /\bnon[-\s]*prime\b|\bnonprime\b/
    if (nonPrimeRegex.test(t)) return true
    return !/\bprime\b/.test(t)
  })
)

const filteredPrimeWarframes = computed<Warframe[]>(() => {
  const q = String(query.value || '').toLowerCase().trim()
  if (!q) return primeWarframes.value
  return primeWarframes.value.filter(w => String(w.name || '').toLowerCase().includes(q))
})

const filteredNonPrimeWarframes = computed<Warframe[]>(() => {
  const q = String(query.value || '').toLowerCase().trim()
  if (!q) return nonPrimeWarframes.value
  return nonPrimeWarframes.value.filter(w => String(w.name || '').toLowerCase().includes(q))
})

function handleUpdate(payload: any) {
  if (!payload || !payload.name) return
  collection.setOverride(payload.name, payload)
}
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.section {
  margin-bottom: 20px;
}

.section h3 {
  margin: 8px 0;
}
/* center the page content */
.warframes {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px;
}
</style>
