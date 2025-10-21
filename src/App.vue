<template>
  <div class="app-shell">
    <div class="layout-grid">
      <NavBar class="site-nav" @navigate="onNavigate" />
      <div class="content-area">
  <div class="brand">
    <img src="/assets/logo.png" alt="Arsenal Tracker logo" class="site-logo" />
    <header class="app-title">Arsenal Tracker</header>
  </div>
  <header class="page-title">{{ pageTitle }}</header>
        <main>
          <Dashboard v-if="view==='dashboard'" />
          <Warframes v-else-if="view==='warframes'" />
          <Weapons v-else-if="view==='weapons'" />
          <Primary v-else-if="view==='primary'" />
          <Secondary v-else-if="view==='secondary'" />
          <Melee v-else-if="view==='melee'" />
          <div v-else class="fallback">Nothing to display — select a page from the nav.</div>
        </main>
        <AppFooter class="site-nav" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Dashboard from './pages/Dashboard.vue'
import Warframes from './pages/Warframes.vue'
import Weapons from './pages/Weapons.vue'
import Primary from './pages/Primary.vue'
import Secondary from './pages/Secondary.vue'
import Melee from './pages/Melee.vue'
import NavBar from './components/NavBar.vue'
import AppFooter from './components/AppFooter.vue'

const view = ref<'dashboard'|'warframes'|'weapons'|'primary'|'secondary'|'melee'>('dashboard')

function onNavigate(v: 'dashboard'|'warframes'|'weapons'|'primary'|'secondary'|'melee') {
  // eslint-disable-next-line no-console
  console.log('[App] onNavigate ->', v)
  view.value = v
}

import { computed } from 'vue'
const pageTitle = computed(() => {
  switch (view.value) {
    case 'dashboard': return 'Dashboard'
    case 'warframes': return 'Warframes'
    case 'weapons': return 'Weapons'
    case 'primary': return 'Primary'
    case 'secondary': return 'Secondary'
    case 'melee': return 'Melee'
    default: return ''
  }
})
</script>

<style scoped>
.layout-grid { display:flex; min-height:100vh }
.content-area { flex:1; display:flex; flex-direction:column; }
.app-shell main { padding:48px 18px; }
.content-area > main { flex: 1 1 auto; display: block; }
.page-title {
  text-align: center;
  font-weight: 700;
  font-size: 1.25rem;
  padding: 18px 12px 6px 12px;
  color: var(--accent-gold, #ffd54a);
}
.app-title {
  text-align: center;
  font-weight: 900;
  font-size: 1.5rem;
  padding: 8px 12px 4px 12px;
  color: var(--accent-gold, #ffd54a);
  letter-spacing: 0.6px;
}
.brand { display:flex; flex-direction:column; align-items:center; gap:6px }
.site-logo { width:48px; height:48px; object-fit:contain; display:block }
/* active-view removed */
.fallback { color:#cfcfcf; padding:18px }
</style>
