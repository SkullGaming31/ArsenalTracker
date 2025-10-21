<template>
  <div class="dashboard">
    <h1>Arsenal Overview</h1>
    <p class="lead">A summary of your collection and mastery progress.</p>

    <div class="cards">
      <div class="card summary stat-card">
        <div class="stat-left">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 2v20M2 12h20" stroke="#9fb8a6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="stat-body">
          <h4>Warframes</h4>
          <div class="big">{{ totalWarframesMastered }} <small class="muted">/ {{ totalWarframes }}</small></div>
          <div class="muted small-row">Primes: {{ wfPrimesCompleted }} / {{ wfPrimesTotal }} · Standard: {{ wfStandardsCompleted }} / {{ wfStandardsTotal }}</div>
          <div class="progress-small"><div class="fill" :style="{ width: Math.round((totalWarframesMastered/Math.max(1,totalWarframes))*100) + '%' }"></div></div>
        </div>
      </div>

      <div class="card summary stat-card">
        <div class="stat-left">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M4 20h16M8 4v12" stroke="#ffd54a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="stat-body">
          <h4>Primaries</h4>
          <div class="big">{{ mastered.primary }} <small class="muted">/ {{ total.primary }}</small></div>
          <div class="muted small-row">Primes: {{ primaryPrimesCompleted }} / {{ primaryPrimesTotal }} · Standard: {{ primaryStandardsCompleted }} / {{ primaryStandardsTotal }}</div>
          <div class="progress-small"><div class="fill" :style="{ width: Math.round((mastered.primary/Math.max(1,total.primary))*100) + '%' , background:'#ffd54a' }"></div></div>
        </div>
      </div>

      <div class="card summary stat-card">
        <div class="stat-left">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 2l7 7-7 7-7-7 7-7z" stroke="#9b5cff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="stat-body">
          <h4>Secondaries</h4>
          <div class="big">{{ mastered.secondary }} <small class="muted">/ {{ total.secondary }}</small></div>
          <div class="muted small-row">Primes: {{ secondaryPrimesCompleted }} / {{ secondaryPrimesTotal }} · Standard: {{ secondaryStandardsCompleted }} / {{ secondaryStandardsTotal }}</div>
          <div class="progress-small"><div class="fill" :style="{ width: Math.round((mastered.secondary/Math.max(1,total.secondary))*100) + '%' , background:'#9b5cff' }"></div></div>
        </div>
      </div>

      <div class="card summary stat-card">
        <div class="stat-left">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 2c3 4 6 4 8 8s-2 8-8 12c-6-4-9-8-8-12s5-6 8-8z" stroke="#2bb673" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="stat-body">
          <h4>Melee</h4>
          <div class="big">{{ mastered.melee }} <small class="muted">/ {{ total.melee }}</small></div>
          <div class="muted small-row">Primes: {{ meleePrimesCompleted }} / {{ meleePrimesTotal }} · Standard: {{ meleeStandardsCompleted }} / {{ meleeStandardsTotal }}</div>
          <div class="progress-small"><div class="fill" :style="{ width: Math.round((mastered.melee/Math.max(1,total.melee))*100) + '%' , background:'#2bb673' }"></div></div>
        </div>
      </div>
    </div>
    <!-- Import / Export controls -->
    <div class="recent">
      <h3>Import / Export</h3>
      <p class="muted small-row">Export your local collection overrides or import a previously saved JSON backup.</p>
      <div style="display:flex; gap:8px; margin-top:8px;">
        <button @click="onExport" class="tag">Export JSON</button>
        <button @click="onExportCSV" class="tag">Export CSV</button>
        <label class="tag" style="cursor:pointer">
          Import JSON/CSV
          <input type="file" ref="fileInput" @change="onFileChange" accept="application/json,text/csv,text/plain" style="display:none" />
        </label>
        <button class="tag" @click="onClear">Clear Local Overrides</button>
      </div>
      <div v-if="previewRows && previewRows.length" style="margin-top:12px">
        <h4>Import preview (first {{ Math.min(10, previewRows.length) }} rows)</h4>
        <div style="max-height:220px; overflow:auto; border:1px solid rgba(255,255,255,0.03); padding:6px; border-radius:6px">
          <table style="width:100%">
            <thead>
              <tr>
                <th v-for="h in previewHeaders" :key="h">{{ h }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, idx) in previewRows.slice(0,10)" :key="idx">
                <td v-for="h in previewHeaders" :key="h">{{ r[h] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="margin-top:8px; display:flex; gap:8px">
          <button class="tag" @click="applyPreview">Confirm Import</button>
          <button class="tag" @click="clearPreview">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCollectionStore } from '../stores/collection'
import { ref, computed } from 'vue'
import { parseImportFile, mapRowsToOverrides, exportOverridesToCSV } from '../lib/importer'

const collection = useCollectionStore()
const wf = computed(() => collection.mergedWarframes)
const wp = computed(() => collection.mergedWeapons)

const totalWarframes = computed(() => wf.value.length)

// helpers to coerce various flag shapes into booleans
const flagTrue = (v: any) => {
  if (v === true) return true
  if (v === false) return false
  if (typeof v === 'string') return v.toLowerCase() === 'true'
  if (typeof v === 'number') return v !== 0
  return Boolean(v)
}

const totalWarframesMastered = computed(() => wf.value.filter((w: any) => flagTrue(w.is_mastered)).length)

const total = computed(() => ({
  primary: wp.value.filter((w: any) => w.category === 'primary').length,
  secondary: wp.value.filter((w: any) => w.category === 'secondary').length,
  melee: wp.value.filter((w: any) => w.category === 'melee').length,
}))

const mastered = computed(() => ({
  primary: wp.value.filter((w: any) => w.category === 'primary' && w.is_mastered).length,
  secondary: wp.value.filter((w: any) => w.category === 'secondary' && w.is_mastered).length,
  melee: wp.value.filter((w: any) => w.category === 'melee' && w.is_mastered).length,
}))

// helper to identify prime vs non-prime
const isPrime = (typeStr: string) => {
  const t = String(typeStr || '').toLowerCase()
  return /\bprime\b/.test(t) && !/\bnon[-\s]*prime\b/.test(t)
}

// Warframe prime/standard totals and completed (any parts collected)
const wfPrimesTotal = computed(() => wf.value.filter((w: any) => isPrime(w.type)).length)
const wfStandardsTotal = computed(() => wf.value.filter((w: any) => !isPrime(w.type)).length)
const partCollected = (w: any) => flagTrue(w.neuroptics_collected) || flagTrue(w.chassis_collected) || flagTrue(w.systems_collected) || flagTrue(w.blueprint_collected)
const wfPrimesCompleted = computed(() => wf.value.filter((w: any) => isPrime(w.type) && partCollected(w)).length)
const wfStandardsCompleted = computed(() => wf.value.filter((w: any) => !isPrime(w.type) && partCollected(w)).length)

// Weapon category helper (use computed .value)
const primesIn = (cat: string) => wp.value.filter((w: any) => w.category === cat && isPrime(w.type))
const standardsIn = (cat: string) => wp.value.filter((w: any) => w.category === cat && !isPrime(w.type))

const primaryPrimesTotal = computed(() => primesIn('primary').length)
const primaryStandardsTotal = computed(() => standardsIn('primary').length)
const primaryPrimesCompleted = computed(() => primesIn('primary').filter((w: any) => flagTrue(w.is_crafted) || flagTrue(w.is_mastered)).length)
const primaryStandardsCompleted = computed(() => standardsIn('primary').filter((w: any) => flagTrue(w.is_crafted) || flagTrue(w.is_mastered)).length)

const secondaryPrimesTotal = computed(() => primesIn('secondary').length)
const secondaryStandardsTotal = computed(() => standardsIn('secondary').length)
const secondaryPrimesCompleted = computed(() => primesIn('secondary').filter((w: any) => flagTrue(w.is_crafted) || flagTrue(w.is_mastered)).length)
const secondaryStandardsCompleted = computed(() => standardsIn('secondary').filter((w: any) => flagTrue(w.is_crafted) || flagTrue(w.is_mastered)).length)

const meleePrimesTotal = computed(() => primesIn('melee').length)
const meleeStandardsTotal = computed(() => standardsIn('melee').length)
const meleePrimesCompleted = computed(() => primesIn('melee').filter((w: any) => flagTrue(w.is_crafted) || flagTrue(w.is_mastered)).length)
const meleeStandardsCompleted = computed(() => standardsIn('melee').filter((w: any) => flagTrue(w.is_crafted) || flagTrue(w.is_mastered)).length)

// (collection already initialized above)

const fileInput = ref<HTMLInputElement | null>(null)
const previewRows = ref<any[] | null>(null)
const previewHeaders = ref<string[]>([])

function onExportCSV() {
  const text = exportOverridesToCSV(collection.overrides)
  const blob = new Blob([text], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'arsenaltracker-backup.csv'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function onExport() {
  const text = collection.exportState()
  const blob = new Blob([text], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'arsenaltracker-backup.json'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function onFileChange(e: Event) {
  const el = e.target as HTMLInputElement
  const file = el.files && el.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    const text = String(reader.result || '')
    const parsed = parseImportFile(text)
    if (parsed.type === 'versioned') {
      // directly import the versioned payload
      if (collection.importState(JSON.stringify(parsed.payload))) {
        alert('Import successful')
      } else {
        alert('Import failed — invalid payload')
      }
      return
    }
    if (parsed.type === 'csv' || parsed.type === 'json') {
      // show preview and keep rows for confirmation
      previewRows.value = parsed.rows as any[] || []
      previewHeaders.value = previewRows.value && previewRows.value.length ? Object.keys(previewRows.value[0]) : []
      return
    }
    alert('Import failed — unsupported file format')
  }
  reader.readAsText(file)
  // reset so same file can be selected again
  el.value = ''
}

function applyPreview() {
  if (!previewRows.value || previewRows.value.length === 0) return
  const overrides = mapRowsToOverrides(previewRows.value as any[])
  // apply overrides into store
  // merge into existing overrides
  Object.keys(overrides).forEach(name => {
    collection.setOverride(name, overrides[name])
  })
  // clear preview
  previewRows.value = null
  previewHeaders.value = []
  alert('Import applied')
}

function clearPreview() {
  previewRows.value = null
  previewHeaders.value = []
}

function onClear() {
  if (confirm('Clear all local overrides? This cannot be undone.')) {
    collection.clearOverrides()
    alert('Local overrides cleared')
  }
}

// recently collected removed
</script>

<style scoped>
.dashboard { max-width:1200px; margin: 16px auto; padding: 16px }
.lead { color: #9fb8a6; margin-bottom:12px }
.cards { display:grid; grid-template-columns: repeat(auto-fit,minmax(220px,1fr)); gap:12px }
.card.summary { background:linear-gradient(180deg, rgba(255,255,255,0.015), rgba(255,255,255,0.01)); color:#e8f6ee; padding:14px; border-radius:12px; border:1px solid rgba(255,255,255,0.03); display:flex; gap:12px; align-items:center }
.stat-left { width:48px; height:48px; display:flex; align-items:center; justify-content:center; background: rgba(255,255,255,0.02); border-radius:8px }
.stat-body h4 { margin:0; font-size:0.95rem }
.big { font-size:1.4rem; font-weight:700 }
.muted { color:#9fb8a6; font-weight:500; margin-left:8px }
.progress-small { height:8px; background:rgba(255,255,255,0.03); border-radius:6px; margin-top:8px; overflow:hidden }
.progress-small .fill { height:100%; width:20%; background:#9fb8a6; transition:width .25s ease }
.recent { margin-top:20px; background: linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.005)); border:1px solid rgba(255,255,255,0.025); padding:12px; border-radius:10px }
.recent ul { list-style:none; margin:0; padding:0 }
.recent li { padding:8px 6px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.01) }
.recent li:last-child { border-bottom: none }
.tag { background: rgba(255,255,255,0.02); color:#cfe8d6; padding:4px 8px; border-radius:999px; font-size:0.8rem }
</style>

