<template>
  <footer class="app-footer">
    <div class="inner">
      <div class="links">
        <a class="icon-link" href="https://discord.com/invite/6TGV75sDjW" target="_blank" rel="noreferrer" aria-label="Discord">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M7.877 12.18c.98 0 1.78-.9 1.78-2.01 0-1.11-.8-2.01-1.78-2.01-.98 0-1.78.9-1.78 2.01 0 1.11.8 2.01 1.78 2.01z" fill="#B9C6D6"/>
            <path d="M16.123 12.18c.98 0 1.78-.9 1.78-2.01 0-1.11-.8-2.01-1.78-2.01-.98 0-1.78.9-1.78 2.01 0 1.11.8 2.01 1.78 2.01z" fill="#B9C6D6"/>
            <path d="M21 3s-2.1-1.5-6-1.5S9 3 9 3 7 3.8 7 6v9.5c0 1.66 1.34 3 3 3h6c1.66 0 3-1.34 3-3V6c0-2.2-2-3-2-3z" fill="#2B2F33" opacity="0.9"/>
          </svg>
        </a>
        <a class="icon-link" href="https://www.instagram.com/skullgaminghq1" target="_blank" rel="noreferrer" aria-label="Instagram">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <rect x="3" y="3" width="18" height="18" rx="4" stroke="#B9C6D6" stroke-width="1.2" fill="none"/>
            <circle cx="12" cy="12" r="3.2" fill="#B9C6D6" />
            <circle cx="17.5" cy="6.5" r="0.6" fill="#B9C6D6" />
          </svg>
        </a>
        <a class="icon-link" href="https://twitter.com/skullgaminghq" target="_blank" rel="noreferrer" aria-label="Twitter X">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M22 5.92c-.64.3-1.3.5-2 .6.72-.44 1.28-1.16 1.55-2.02-.68.4-1.44.68-2.24.83C18.5 4 17.48 3.5 16.34 3.5c-1.77 0-3.2 1.46-3.2 3.26 0 .26.03.52.08.77-2.66-.13-5.03-1.46-6.62-3.47-.28.47-.44 1.02-.44 1.6 0 1.1.54 2.1 1.37 2.7-.5 0-.98-.15-1.4-.4v.04c0 1.56 1.1 2.86 2.56 3.16-.27.08-.56.12-.86.12-.2 0-.4-.02-.6-.06.4 1.22 1.5 2.1 2.8 2.12C9.14 18.5 7.9 19 6.6 19c-.36 0-.7-.02-1.04-.06C6.6 19.96 8.5 20.5 10.5 20.5c7.2 0 11.14-6.1 11.14-11.38 0-.18-.01-.36-.02-.53.76-.56 1.4-1.27 1.92-2.07z" fill="#B9C6D6"/>
          </svg>
        </a>
      </div>
      <div class="copy">© {{ year }} SkullGamingHQ</div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<style scoped>
.app-footer { border-top: 1px solid rgba(255,255,255,0.03); padding: 18px 12px; background: #071013; color: #cfeadf; margin-top: 20px }
.app-footer .inner { max-width:1200px; margin:0 auto; display:flex; align-items:center; justify-content:space-between }
.app-footer .links a { margin-right:12px; color:inherit; text-decoration:none }
.app-footer .copy { color:#9fb8a6 }
  .app-footer .links { display:flex; align-items:center }
  .icon-link { display:inline-flex; align-items:center; justify-content:center; width:36px; height:36px; border-radius:8px; background:transparent; margin-right:8px; transition:background .12s ease }
  .icon-link svg { display:block }
  .icon-link:hover { background: rgba(255,255,255,0.02) }
  .app-footer .copy { color:#9fb8a6 }
</style>
