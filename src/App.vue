<template>
  <div class="app-shell">
    <div class="layout-grid">
      <NavBar class="site-nav" @navigate="onNavigate" />
      <div class="content-area">
        <AppHeader
          v-model:query="globalQuery"
          v-model:hideCompleted="globalHideCompleted"
          :pageSubtitle="pageSubtitle"
          :showControls="view==='warframes' || view==='weapons'"
        />
        <main>
          <Dashboard v-if="view==='dashboard'" />
          <Warframes v-else-if="view==='warframes'" v-model:query="globalQuery" v-model:hideCompleted="globalHideCompleted" />
          <Weapons v-else-if="view==='weapons'" v-model:query="globalQuery" v-model:hideCompleted="globalHideCompleted" />
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
import { ref, computed } from 'vue'
import Dashboard from './pages/Dashboard.vue'
import Warframes from './pages/Warframes.vue'
import Weapons from './pages/Weapons.vue'
import Primary from './pages/Primary.vue'
import Secondary from './pages/Secondary.vue'
import Melee from './pages/Melee.vue'
import NavBar from './components/NavBar.vue'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'

const view = ref<'dashboard'|'warframes'|'weapons'|'primary'|'secondary'|'melee'>('dashboard')
// Global header controls (driven from header, passed to pages)
const globalQuery = ref<string>('')
const globalHideCompleted = ref<boolean>(false)
function onNavigate(v: 'dashboard'|'warframes'|'weapons'|'primary'|'secondary'|'melee') {
  console.log('[App] onNavigate ->', v)
  view.value = v
}
// const pageTitle = computed(() => {
//   switch (view.value) {
//     case 'dashboard': return 'Dashboard'
//     case 'warframes': return 'Warframes'
//     case 'weapons': return 'Weapons'
//     case 'primary': return 'Primary'
//     case 'secondary': return 'Secondary'
//     case 'melee': return 'Melee'
//     default: return ''
//   }
// })

// Per-page subtitle text (conditional). Keep short and centered under the main title.
const pageSubtitle = computed(() => {
  switch (view.value) {
    case 'warframes': return 'Track your collection progress across all warframes'
    case 'weapons': return 'Track your collection and mastery progress across all weapons'
    default: return 'Welcome to the Arsenal Tracker'
  }
})
</script>

<style scoped>
.layout-grid { display:flex; min-height:100vh }
.content-area { flex:1; display:flex; flex-direction:column; }
.app-shell main { padding:48px 18px; }
.content-area > main { flex: 1 1 auto; display: block; }
.fallback { color:#cfcfcf; padding:18px }
</style>
