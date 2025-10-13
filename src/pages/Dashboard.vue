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

    <!-- recently collected removed per request -->
  </div>
</template>

<script setup lang="ts">
import warframes from '../data/warframes.json'
import weapons from '../data/weapons.json'
import { computed } from 'vue'

const wf = warframes as any[]
const wp = weapons as any[]

const totalWarframes = wf.length
const totalWarframesMastered = wf.filter(w => w.is_mastered).length

const total = {
  primary: wp.filter(w => w.category === 'primary').length,
  secondary: wp.filter(w => w.category === 'secondary').length,
  melee: wp.filter(w => w.category === 'melee').length,
}

const mastered = {
  primary: wp.filter(w => w.category === 'primary' && w.is_mastered).length,
  secondary: wp.filter(w => w.category === 'secondary' && w.is_mastered).length,
  melee: wp.filter(w => w.category === 'melee' && w.is_mastered).length,
}

// helper to identify prime vs non-prime
const isPrime = (typeStr: string) => {
  const t = String(typeStr || '').toLowerCase()
  return /\bprime\b/.test(t) && !/\bnon[-\s]*prime\b/.test(t)
}

// Warframe prime/standard totals and completed (any parts collected)
const wfPrimesTotal = wf.filter(w => isPrime(w.type)).length
const wfStandardsTotal = wf.filter(w => !isPrime(w.type)).length
const wfPrimesCompleted = wf.filter(w => isPrime(w.type) && (w.neuroptics_collected || w.chassis_collected || w.systems_collected || w.blueprint_collected)).length
const wfStandardsCompleted = wf.filter(w => !isPrime(w.type) && (w.neuroptics_collected || w.chassis_collected || w.systems_collected || w.blueprint_collected)).length

// Weapon category helper
const primesIn = (cat: string) => wp.filter(w => w.category === cat && isPrime(w.type))
const standardsIn = (cat: string) => wp.filter(w => w.category === cat && !isPrime(w.type))

const primaryPrimesTotal = primesIn('primary').length
const primaryStandardsTotal = standardsIn('primary').length
const primaryPrimesCompleted = primesIn('primary').filter(w => w.is_crafted || w.is_mastered).length
const primaryStandardsCompleted = standardsIn('primary').filter(w => w.is_crafted || w.is_mastered).length

const secondaryPrimesTotal = primesIn('secondary').length
const secondaryStandardsTotal = standardsIn('secondary').length
const secondaryPrimesCompleted = primesIn('secondary').filter(w => w.is_crafted || w.is_mastered).length
const secondaryStandardsCompleted = standardsIn('secondary').filter(w => w.is_crafted || w.is_mastered).length

const meleePrimesTotal = primesIn('melee').length
const meleeStandardsTotal = standardsIn('melee').length
const meleePrimesCompleted = primesIn('melee').filter(w => w.is_crafted || w.is_mastered).length
const meleeStandardsCompleted = standardsIn('melee').filter(w => w.is_crafted || w.is_mastered).length

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

