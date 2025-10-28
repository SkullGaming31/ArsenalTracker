<template>
  <header class="app-header">
    <div class="header-left">
      <div class="brand">
        <img src="/assets/logo.png" alt="Arsenal Tracker logo" class="site-logo" />
        <div class="app-title">Arsenal Tracker</div>
      </div>
      <div class="page-meta">
        <div class="page-subtitle" v-if="pageSubtitle">{{ pageSubtitle }}</div>
      </div>
    </div>

    <div class="header-controls" v-if="showControls">
      <input class="header-search" :value="query" @input="onInput" placeholder="Search..." />
      <label class="toggle">
        <input type="checkbox" :checked="hideCompleted" @change="onHideChange" />
        <span class="slider" aria-hidden></span>
        <span class="toggle-label">Hide completed</span>
      </label>
    </div>
  </header>
</template>

<script setup lang="ts">
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

function onInput(e: Event) {
  const t = e.target as HTMLInputElement | null
  if (!t) return
  emit('update:query', t.value)
}

function onHideChange(e: Event) {
  const t = e.target as HTMLInputElement | null
  if (!t) return
  emit('update:hideCompleted', t.checked)
}
</script>

<style scoped>
.app-header { border-bottom: 3px solid grey; padding: 12px 18px; display:flex; flex-direction:row; align-items:center; justify-content:space-between; gap:12px }
.header-left { display:flex; flex-direction:column; gap:6px }
.brand { display:flex; flex-direction:column; align-items:flex-start; gap:6px; padding-left:18px }
.site-logo { width:48px; height:48px; object-fit:contain; display:block; margin-bottom:0 }
.app-title { text-align: left; font-weight: 900; font-size: 1.5rem; padding: 8px 12px 4px 18px; color: var(--accent-gold, #ffd54a); letter-spacing: 0.6px; }
.page-subtitle { text-align:left; color: var(--muted, #9fb8a6); font-size:0.95rem; margin:6px 0 0 }
.header-controls { display:flex; gap:10px; align-items:center }
.header-search { padding:6px 8px; border-radius:6px; background:#0b0c0d; color:#eee; border:1px solid #2b2f33 }
</style>
