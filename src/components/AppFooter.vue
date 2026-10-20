<template>
  <q-footer class="app-footer" elevated>
    <div :class="['inner', { centered: centered }]">
      <div v-if="!centered"></div>
      <div class="copy">© {{ year }} SkullGamingHQ — All rights reserved.</div>
    </div>
  </q-footer>
</template>

<script setup lang="ts">
const { centered = false } = defineProps<{ centered?: boolean }>()
const year = new Date().getFullYear()
</script>

<style scoped>
.app-footer {
  border-top: 1px solid rgba(0, 212, 255, 0.2);
  padding: 18px 12px;
  background: rgba(5, 8, 16, 0.9);
  color: #cfeadf;
  margin-top: 0;
  position: relative;
  backdrop-filter: blur(8px);
}
.app-footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent-cyan), transparent);
  opacity: 0.5;
}
.app-footer .inner {
  max-width:1200px;
  margin:0 auto;
  display:flex;
  align-items:center;
  justify-content:space-between
}
.app-footer .inner.centered { justify-content:center }
.app-footer .links a { margin-right:12px; color:inherit; text-decoration:none }
.app-footer .copy {
  color:#7a9a8c;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.9rem;
}
  .app-footer .links { display:flex; align-items:center }
  .icon-link {
    display:inline-flex;
    align-items:center;
    justify-content:center;
    width:36px;
    height:36px;
    border-radius:8px;
    background:transparent;
    margin-right:8px;
    border: 1px solid rgba(0, 212, 255, 0.1);
    transition:all .2s ease
  }
  .icon-link svg { display:block }
  .icon-link:hover {
    background: rgba(0, 212, 255, 0.1);
    border-color: var(--accent-cyan);
    box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
  }
  .app-footer .copy { color:#7a9a8c }
</style>
