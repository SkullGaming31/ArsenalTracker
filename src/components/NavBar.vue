<template>
  <aside class="sidebar">
  <!-- brand removed: title moved to top center in App.vue -->
    <nav class="links">
  <button data-testid="nav-dashboard" @click="navigate('dashboard')">Dashboard</button>
  <button data-testid="nav-warframes" @click="navigate('warframes')">Warframes</button>
  <button data-testid="nav-weapons" @click="navigate('weapons')">All Weapons</button>
  <button data-testid="nav-primary" @click="navigate('primary')">Primary</button>
  <button data-testid="nav-secondary" @click="navigate('secondary')">Secondary</button>
  <button data-testid="nav-melee" @click="navigate('melee')">Melee</button>
    </nav>
      <div class="debug">Last: {{ last }}</div>
      <div class="nav-socials">
        <div class="social-links">
    <a class="icon-link discord" href="https://discord.com/invite/6TGV75sDjW" target="_blank" rel="noreferrer" aria-label="Discord">
      <!-- Official Discord mark (glyph only) -->
      <svg width="20" height="20" viewBox="0 0 71 55" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path fill="#5865F2" d="M60.104 4.552A58.648 58.648 0 0046.852.75a41.979 41.979 0 00-1.98 4.1 55.6 55.6 0 00-14.74 0 41.548 41.548 0 00-1.9-4.1 58.87 58.87 0 00-13.26 3.8C6.98 17.3 4.9 29.2 6.66 40.7 20.36 46 33.2 47.9 46.14 47.4c.1-.14.2-.28.3-.42.03 0 .06.01.09.01 13 0 25-1.5 39.3-6.9 1.76-11.6-.32-23.6-10.32-36.44z"/>
      </svg>
    </a>
    <a class="icon-link instagram" href="https://www.instagram.com/skullgaminghq1" target="_blank" rel="noreferrer" aria-label="Instagram">
      <!-- Instagram gradient glyph -->
      <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <defs>
          <linearGradient id="igGrad" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stop-color="#f58529"/>
            <stop offset="50%" stop-color="#dd2a7b"/>
            <stop offset="100%" stop-color="#8134af"/>
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#igGrad)"/>
        <g transform="translate(4,4) scale(0.6)" fill="#fff">
          <path d="M12 7.2A4.8 4.8 0 1012 16.8 4.8 4.8 0 0012 7.2zm0 7.9a3.1 3.1 0 110-6.2 3.1 3.1 0 010 6.2z"/>
          <circle cx="17.5" cy="6.5" r="0.9"/>
        </g>
      </svg>
    </a>
    <a class="icon-link twitter" href="https://twitter.com/skullgaminghq" target="_blank" rel="noreferrer" aria-label="Twitter X">
      <!-- Official Twitter bird -->
      <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path fill="#1DA1F2" d="M22.46 6c-.77.35-1.6.58-2.46.69a4.3 4.3 0 001.88-2.37 8.59 8.59 0 01-2.71 1.04 4.28 4.28 0 00-7.3 3.9A12.14 12.14 0 013 4.79a4.28 4.28 0 001.33 5.72 4.24 4.24 0 01-1.94-.54v.05a4.28 4.28 0 003.43 4.2c-.49.13-1.01.2-1.54.08a4.28 4.28 0 003.99 2.97A8.58 8.58 0 012 19.54 12.1 12.1 0 008.29 21c7.55 0 11.68-6.26 11.68-11.68v-.53A8.36 8.36 0 0022.46 6z"/>
      </svg>
    </a>
        </div>
      </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'navigate', view: 'dashboard'|'warframes'|'weapons'|'primary'|'secondary'|'melee'): void
}>()

const last = ref<string>('none')

function navigate(view: 'dashboard'|'warframes'|'weapons'|'primary'|'secondary'|'melee') {
  // log for debug to confirm clicks
  // eslint-disable-next-line no-console
  console.log('[NavBar] navigate ->', view)
  emit('navigate', view)
  last.value = view
}
</script>

<style scoped>
.sidebar {
  width: 220px;
  min-height: 100vh;
  display:flex;
  flex-direction:column;
  padding:18px 12px;
  background: var(--bg-800);
  color: #e8f7ee;
  box-shadow: 2px 0 8px rgba(0,0,0,0.35);
  position:sticky;
  top:0;
  z-index: 20; /* ensure sidebar sits above page content */
}
.brand { font-weight:700; font-size:1.05rem; margin-bottom:12px }
.links { display:flex; flex-direction:column; gap:8px }
.links button { text-align:left; padding:8px 12px; border-radius:8px; background:transparent; color:inherit; border:1px solid rgba(255,255,255,0.03); cursor:pointer }
.links button:hover { background: rgba(255,255,255,0.02) }
.debug { margin-top:auto; font-size:0.8rem; color:var(--muted) }
.nav-socials { margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,1); }
.nav-socials .social-links { display:flex; gap:8px; margin-top:8px }
.nav-socials .icon-link { display:inline-flex; align-items:center; justify-content:center; width:36px; height:36px; border-radius:8px; background:transparent }
.nav-socials .icon-link svg { display:block }
.nav-socials .icon-link:hover { background: rgba(255,255,255,0.02) }
.nav-socials .icon-link { pointer-events: auto }
</style>
