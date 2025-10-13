<template>
  <div class="app-shell">
    <NavBar @navigate="onNavigate" />
    <div class="active-view">Active view: {{ view }}</div>

    <main>
      <Dashboard v-if="view==='dashboard'" />
      <Warframes v-else-if="view==='warframes'" />
      <Weapons v-else-if="view==='weapons'" />
      <Primary v-else-if="view==='primary'" />
      <Secondary v-else-if="view==='secondary'" />
      <Melee v-else-if="view==='melee'" />
      <div v-else class="fallback">Nothing to display — select a page from the nav.</div>
    </main>
    <AppFooter />
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
</script>

<style scoped>
.topnav { display:flex; gap:8px; padding:12px; background:#071013 }
.topnav button { padding:8px 12px; border-radius:6px; background:transparent; color:#cfeadf; border:1px solid transparent }
.topnav button.active { background:#0f6; border-color:rgba(255,255,255,0.04) }
.app-shell main { padding:72px 12px 12px 12px }
.fallback { color:#cfcfcf; padding:18px }
</style>
