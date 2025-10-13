<template>
  <header class="nav">
    <div class="brand">Arsenal Tracker</div>
    <nav class="links">
      <button @click="navigate('dashboard')">Dashboard</button>
      <button @click="navigate('warframes')">Warframes</button>
      <button @click="navigate('weapons')">All Weapons</button>
      <button @click="navigate('primary')">Primary</button>
      <button @click="navigate('secondary')">Secondary</button>
      <button @click="navigate('melee')">Melee</button>
    </nav>
    <div class="debug">Last: {{ last }}</div>
  </header>
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
.nav { display:flex; align-items:center; justify-content:space-between; padding:12px 18px; background:#071013; color:#e8f7ee; position:sticky; top:0; z-index:1000; box-shadow: 0 2px 8px rgba(0,0,0,0.4) }
.brand { font-weight:700 }
.links button { margin-left:8px; padding:6px 10px; border-radius:6px; background:transparent; color:inherit; border:1px solid rgba(255,255,255,0.03); cursor:pointer }
.debug { margin-top:6px; font-size:0.8rem; color:#9fb8a6 }
</style>
