<template>
  <footer class="app-footer">
    <div :class="['inner', { centered: centered }]">
      <div></div>
      <div class="copy">© {{ year }} SkullGamingHQ — All rights reserved.</div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { centered = false } = defineProps<{ centered?: boolean }>()
const year = new Date().getFullYear()
</script>

<style scoped>
.app-footer { border-top: 1px solid rgba(255,255,255,0.03); padding: 18px 12px; background: #071013; color: #cfeadf; margin-top: 0 }
.app-footer .inner { max-width:1200px; margin:0 auto; display:flex; align-items:center; justify-content:space-between }
.app-footer .inner.centered { justify-content:center }
.app-footer .links a { margin-right:12px; color:inherit; text-decoration:none }
.app-footer .copy { color:#9fb8a6 }
  .app-footer .links { display:flex; align-items:center }
  .icon-link { display:inline-flex; align-items:center; justify-content:center; width:36px; height:36px; border-radius:8px; background:transparent; margin-right:8px; transition:background .12s ease }
  .icon-link svg { display:block }
  .icon-link:hover { background: rgba(255,255,255,0.02) }
  .app-footer .copy { color:#9fb8a6 }
</style>
