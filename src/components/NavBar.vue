<template>
  <aside class="sidebar" aria-label="Main navigation">
  <!-- brand removed: title moved to top center in App.vue -->
    <nav class="links">
  <button class="nav-btn nav-home" :class="{ active: activeView === 'landing' }" data-testid="nav-home" @click="navigate('landing')">
    <svg viewBox="0 0 24 24" aria-hidden focusable="false"><path d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-8.5z" fill="currentColor"/></svg>
    <span>Home</span>
  </button>

  <button class="nav-btn nav-dashboard" :class="{ active: activeView === 'dashboard' }" data-testid="nav-dashboard" @click="navigate('dashboard')">
    <svg viewBox="0 0 24 24" aria-hidden focusable="false"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor"/></svg>
    <span>Dashboard</span>
  </button>

  <button class="nav-btn nav-about" :class="{ active: activeView === 'about' }" data-testid="nav-about" @click="navigate('about')">
    <svg viewBox="0 0 24 24" aria-hidden focusable="false"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="currentColor"/></svg>
    <span>About</span>
  </button>

  <button class="nav-btn nav-warframes" :class="{ active: activeView === 'warframes' }" data-testid="nav-warframes" @click="navigate('warframes')">
    <svg viewBox="0 0 24 24" aria-hidden focusable="false"><path d="M12 2l4 7h-8l4-7zm0 4.5L9.2 11h5.6L12 6.5zM4 13c0 5 3 8 8 9 5-1 8-4 8-9H4z" fill="currentColor"/></svg>
    <span>Warframes</span>
  </button>

  <button class="nav-btn nav-weapons" :class="{ active: activeView === 'weapons' }" data-testid="nav-weapons" @click="navigate('weapons')">
    <svg viewBox="0 0 24 24" aria-hidden focusable="false"><path d="M3 21l6-6 3 3 9-9 3 3-12 12-6-6z" fill="currentColor"/></svg>
    <span>All Weapons</span>
  </button>

  <button class="nav-btn nav-primary" :class="{ active: activeView === 'primary' }" data-testid="nav-primary" @click="navigate('primary')">
    <svg viewBox="0 0 24 24" aria-hidden focusable="false"><path d="M2 12h20v2H2zM6 6h12v2H6z" fill="currentColor"/></svg>
    <span>Primary</span>
  </button>

  <button class="nav-btn nav-secondary" :class="{ active: activeView === 'secondary' }" data-testid="nav-secondary" @click="navigate('secondary')">
    <svg viewBox="0 0 24 24" aria-hidden focusable="false"><path d="M3 6h18v2H3zM7 12h10v2H7zM11 18h2v2h-2z" fill="currentColor"/></svg>
    <span>Secondary</span>
  </button>

  <button class="nav-btn nav-melee" :class="{ active: activeView === 'melee' }" data-testid="nav-melee" @click="navigate('melee')">
    <svg viewBox="0 0 24 24" aria-hidden focusable="false"><path d="M12 2l3 7h7l-5.5 4 2 8L12 17 5.5 21l2-8L2 9h7z" fill="currentColor"/></svg>
    <span>Melee</span>
  </button>
    </nav>
      <div class="nav-socials">
        <div class="social-links">
    <a class="icon-link discord" href="https://discord.com/invite/6TGV75sDjW" target="_blank" rel="noreferrer" aria-label="Discord">
      <!-- Discord mark with eye cutouts to avoid solid blob rendering -->
      <svg width="30" height="30" viewBox="0 0 71 55" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path fill="#5865F2" d="M60.104 4.552A58.648 58.648 0 0046.852.75a41.979 41.979 0 00-1.98 4.1 55.6 55.6 0 00-14.74 0 41.548 41.548 0 00-1.9-4.1 58.87 58.87 0 00-13.26 3.8C6.98 17.3 4.9 29.2 6.66 40.7 20.36 46 33.2 47.9 46.14 47.4c.1-.14.2-.28.3-.42.03 0 .06.01.09.01 13 0 25-1.5 39.3-6.9 1.76-11.6-.32-23.6-10.32-36.44z"/>
        <!-- refined eye shapes and subtle mouth to avoid 'blob with two eyes' appearance -->
        <ellipse cx="22" cy="22" rx="4.2" ry="5.2" fill="#fff" transform="rotate(-8 22 22)" />
        <ellipse cx="48" cy="22" rx="4.2" ry="5.2" fill="#fff" transform="rotate(8 48 22)" />
        <!-- small smiling curve for the mouth to improve legibility at small sizes -->
        <path d="M26 31c3 2 10 2 14 0" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.95" />
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
defineProps<{
  activeView?: 'landing'|'about'|'dashboard'|'warframes'|'weapons'|'primary'|'secondary'|'melee'
}>()

const emit = defineEmits<{
  (e: 'navigate', view: 'landing'|'about'|'dashboard'|'warframes'|'weapons'|'primary'|'secondary'|'melee'): void
}>()

function navigate(view: 'landing'|'about'|'dashboard'|'warframes'|'weapons'|'primary'|'secondary'|'melee') {
  // debug log
  console.log('[NavBar] navigate ->', view)
  emit('navigate', view)
}
</script>

<style scoped>
.sidebar {
  width: 220px;
  min-height: 100vh;
  display:flex;
  flex-direction:column;
  padding:18px 12px;
  background: rgba(6,8,12,0.45);
  color: #e8f7ee;
  box-shadow: 2px 0 18px rgba(0,0,0,0.45);
  position:sticky;
  top:0;
  z-index: 20; /* ensure sidebar sits above page content */
  border-right: 1px solid rgba(124,77,255,0.06);
  backdrop-filter: blur(6px) saturate(1.05);
}
.brand { font-weight:700; font-size:1.05rem; margin-bottom:12px }
.links { display:flex; flex-direction:column; gap:8px }
.nav-btn { display:flex; align-items:center; gap:10px; text-align:left; padding:10px 12px; border-radius:10px; background:transparent; color:inherit; border:none; cursor:pointer; transition: all 180ms ease }
.nav-btn svg { width:18px; height:18px; opacity:0.95; flex-shrink:0 }
.nav-btn span { font-size:0.95rem }
.nav-btn:hover { background: rgba(255,255,255,0.02); transform: translateX(4px) }
.nav-btn::before { content: ''; width:4px; height:100%; background: transparent; border-radius:4px; margin-right:6px }
.nav-btn.active { color: #ffffff; box-shadow: 0 6px 22px rgba(124,77,255,0.08); transform: translateX(6px) }
.nav-btn.active::before { background: linear-gradient(180deg, var(--accent, #7c4dff), rgba(124,77,255,0.6)); box-shadow: 0 0 18px var(--accent, #7c4dff)66 }

/* per-button accent colors (so each area can have its own hue) */
.nav-dashboard { --accent: #7c4dff }
.nav-warframes { --accent: #9b5cff }
.nav-weapons { --accent: #00bfff }
.nav-primary { --accent: #ffd54a }
.nav-secondary { --accent: #9b5cff }
.nav-melee { --accent: #2bb673 }
.nav-home { --accent: #00ffff }
.nav-about { --accent: #6ee7b7 }

.nav-socials {
  /* Pin socials to the bottom-left of the viewport so they remain visible on every page.
     Using fixed positioning avoids layout quirks that hid the element on non-dashboard pages. */
  position: fixed;
  left: 18px; /* align with sidebar padding */
  bottom: 18px;
  padding: 8px 10px 6px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.04);
  background: rgba(11,12,13,0.55);
  z-index: 60;
  backdrop-filter: blur(6px);
}
.nav-socials .social-links { display:flex; gap:8px; margin-top:8px }
.nav-socials .icon-link { display:inline-flex; align-items:center; justify-content:center; width:36px; height:36px; border-radius:8px; background:transparent }
.nav-socials .icon-link svg { display:block }
.nav-socials .icon-link:hover { background: rgba(255,255,255,0.02) }
.nav-socials .icon-link { pointer-events: auto }
/* Hide fixed socials on narrow screens where the layout may change */
@media (max-width: 720px) {
  .nav-socials { display: none }
  .sidebar { width: 64px; padding: 12px 8px }
  .nav-btn span { display: none }
}
</style>
