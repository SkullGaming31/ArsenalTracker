<template>
  <header class="app-header">
    <div class="header-left">
      <button class="nav-toggle" @click="toggle" :aria-expanded="drawerOpen" aria-label="Toggle navigation">☰</button>
      <div class="brand">
        <img src="/assets/logo.png" alt="Arsenal Tracker logo" class="site-logo" />
        <div class="app-title">Arsenal Tracker</div>
      </div>
      <div class="page-meta">
        <div class="page-subtitle" v-if="pageSubtitle">{{ pageSubtitle }}</div>
      </div>
    </div>

    <!-- Desktop controls: hidden on small screens -->
    <div class="header-controls" v-if="showControls">
      <q-input dense rounded debounce="200" class="header-search" :model-value="query" @update:model-value="emitQuery" placeholder="Search...">
        <template #append>
          <q-icon name="search" />
        </template>
      </q-input>

      <q-toggle dense :model-value="hideCompleted" @update:model-value="emitHideCompleted" label="Hide completed" />
    </div>

    <!-- Mobile toggle button: shows a popover with the same controls -->
    <div class="header-mobile-controls" v-if="showControls">
  <button class="controls-toggle" @click="controlsOpen = !controlsOpen" :aria-expanded="controlsOpen" aria-label="Show controls">☰</button>
      <div class="controls-popover" v-if="controlsOpen" role="dialog" aria-label="Header controls">
        <q-input dense rounded class="header-search" :model-value="query" @update:model-value="emitQuery" placeholder="Search..." />
        <q-toggle dense :model-value="hideCompleted" @update:model-value="emitHideCompleted" label="Hide completed" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDrawer } from '@/composables/useDrawer'
import { QInput, QToggle, QIcon } from 'quasar'

const { drawerOpen, toggle } = useDrawer()

const { query, hideCompleted, pageSubtitle, showControls } = defineProps<{
  query?: string
  hideCompleted?: boolean
  pageSubtitle?: string
  showControls?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:query', value: string): void
  (e: 'update:hideCompleted', value: boolean): void
}>()

const controlsOpen = ref(false)

function emitQuery(v: string | number | null) {
  // QInput can emit string | number | null; normalize to string for our API
  emit('update:query', v == null ? '' : String(v))
}

function emitHideCompleted(v: boolean | null) {
  // normalize nullable values to boolean
  emit('update:hideCompleted', !!v)
}
</script>

<style scoped>
.header-mobile-controls { display: none }
.controls-toggle { background: transparent; border: 1px solid rgba(255,255,255,0.06); padding:6px 8px; border-radius:6px; color:#fff }
.controls-popover { position: absolute; right: 12px; top: 64px; background: #0b0c0d; padding:12px; border-radius:8px; box-shadow: 0 8px 24px rgba(0,0,0,0.6); z-index: 50; display:flex; flex-direction:column; gap:8px }

@media (max-width: 640px) {
  .header-controls { display: none }
  .header-mobile-controls { display: flex; align-items: center }
  .brand { align-items:flex-start }
  .app-title { font-size: 1.15rem }
}
.app-header { border-bottom: 3px solid grey; padding: 12px 18px; display:flex; flex-direction:row; align-items:center; justify-content:space-between; gap:12px }
.header-left { display:flex; flex-direction:column; gap:6px }
.brand { display:flex; flex-direction:column; align-items:flex-start; gap:6px; padding-left:18px }
.site-logo { width:48px; height:48px; object-fit:contain; display:block; margin-bottom:0 }
.app-title { text-align: left; font-weight: 900; font-size: 1.5rem; padding: 8px 12px 4px 18px; color: var(--accent-gold, #ffd54a); letter-spacing: 0.6px; }
.page-subtitle { text-align:left; color: var(--muted, #9fb8a6); font-size:0.95rem; margin:6px 0 0 }
.header-controls { display:flex; gap:10px; align-items:center }
.header-search { padding:6px 8px; border-radius:6px; background:#0b0c0d; color:#eee; border:1px solid #2b2f33 }
/* ensure the native input inside Quasar's QInput shows white text */
.header-search :deep(input),
.header-search :deep(input::placeholder) {
  color: #ffffff !important;
}

.nav-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width:40px;
  height:40px;
  border-radius:8px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.06);
  color: #fff;
  margin-right: 8px;
  cursor: pointer;
}

@media (min-width: 641px) { .nav-toggle { display: none } }
</style>
