<template>
  <div v-bind="$attrs">
    <!-- Desktop: render a plain persistent sidebar so we don't depend on Quasar QLayout -->
    <aside v-if="isDesktop" class="sidebar" aria-label="Main navigation">
      <div class="brand">Arsenal Tracker</div>
      <nav id="main-nav" class="links">
        <button class="nav-btn" @click="navigate('landing')" :class="{ active: activeView === 'landing' }">
          <svg viewBox="0 0 24 24" aria-hidden focusable="false"><path d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-8.5z" fill="currentColor"/></svg>
          <span>Home</span>
        </button>

        <button class="nav-btn" data-testid="nav-dashboard" @click="navigate('dashboard')" :class="{ active: activeView === 'dashboard' }">
          <svg viewBox="0 0 24 24" aria-hidden focusable="false"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor"/></svg>
          <span>Dashboard</span>
        </button>

        <button class="nav-btn" data-testid="nav-about" @click="navigate('about')" :class="{ active: activeView === 'about' }">
          <svg viewBox="0 0 24 24" aria-hidden focusable="false"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="currentColor"/></svg>
          <span>About</span>
        </button>

        <hr />

        <button class="nav-btn" data-testid="nav-warframes" @click="navigate('warframes')" :class="{ active: activeView === 'warframes' }">
          <svg viewBox="0 0 24 24" aria-hidden focusable="false"><path d="M12 2l4 7h-8l4-7zm0 4.5L9.2 11h5.6L12 6.5zM4 13c0 5 3 8 8 9 5-1 8-4 8-9H4z" fill="currentColor"/></svg>
          <span>Warframes</span>
        </button>

        <button class="nav-btn" data-testid="nav-weapons" @click="navigate('weapons')" :class="{ active: activeView === 'weapons' }">
          <svg viewBox="0 0 24 24" aria-hidden focusable="false"><path d="M3 21l6-6 3 3 9-9 3 3-12 12-6-6z" fill="currentColor"/></svg>
          <span>Weapons</span>
        </button>
        
      </nav>
    </aside>

    <!-- Mobile: use Quasar drawer for overlay behavior -->
    <q-drawer v-else v-model="drawerOpen" bordered side="left" :width="220" aria-label="Main navigation">
      <div class="q-pa-md">
        <div class="brand">Arsenal Tracker</div>
        <q-list id="main-nav" class="links" padding>
          <q-item clickable v-close-popup @click="navigate('landing')" :class="{ active: activeView === 'landing' }">
            <q-item-section avatar>
              <q-icon name="home" />
            </q-item-section>
            <q-item-section>Home</q-item-section>
          </q-item>

          <q-item clickable data-testid="nav-dashboard" v-close-popup @click="navigate('dashboard')" :class="{ active: activeView === 'dashboard' }">
            <q-item-section avatar>
              <q-icon name="dashboard" />
            </q-item-section>
            <q-item-section>Dashboard</q-item-section>
          </q-item>

          <q-item clickable data-testid="nav-about" v-close-popup @click="navigate('about')" :class="{ active: activeView === 'about' }">
            <q-item-section avatar>
              <q-icon name="info" />
            </q-item-section>
            <q-item-section>About</q-item-section>
          </q-item>

          <q-separator />

          <q-item clickable data-testid="nav-warframes" v-close-popup @click="navigate('warframes')" :class="{ active: activeView === 'warframes' }">
            <q-item-section avatar>
              <q-icon name="extension" />
            </q-item-section>
            <q-item-section>Warframes</q-item-section>
          </q-item>

          <q-item clickable data-testid="nav-weapons" v-close-popup @click="navigate('weapons')" :class="{ active: activeView === 'weapons' }">
            <q-item-section avatar>
              <q-icon name="settings_ethernet" />
            </q-item-section>
            <q-item-section>Weapons</q-item-section>
          </q-item>
          
        </q-list>
      </div>
    </q-drawer>
  </div>
    <!-- Social links (kept for desktop and mobile) -->
    <div class="nav-socials" aria-hidden>
      <div class="social-links">
        <a class="icon-link discord" href="https://discord.com/invite/6TGV75sDjW" target="_blank" rel="noreferrer" aria-label="Discord">
          <svg width="30" height="30" viewBox="0 0 71 55" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path fill="#5865F2" d="M60.104 4.552A58.648 58.648 0 0046.852.75a41.979 41.979 0 00-1.98 4.1 55.6 55.6 0 00-14.74 0 41.548 41.548 0 00-1.9-4.1 58.87 58.87 0 00-13.26 3.8C6.98 17.3 4.9 29.2 6.66 40.7 20.36 46 33.2 47.9 46.14 47.4c.1-.14.2-.28.3-.42.03 0 .06.01.09.01 13 0 25-1.5 39.3-6.9 1.76-11.6-.32-23.6-10.32-36.44z"/>
            <ellipse cx="22" cy="22" rx="4.2" ry="5.2" fill="#fff" transform="rotate(-8 22 22)" />
            <ellipse cx="48" cy="22" rx="4.2" ry="5.2" fill="#fff" transform="rotate(8 48 22)" />
            <path d="M26 31c3 2 10 2 14 0" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.95" />
          </svg>
        </a>
        <a class="icon-link instagram" href="https://www.instagram.com/skullgaminghq1" target="_blank" rel="noreferrer" aria-label="Instagram">
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
          <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path fill="#1DA1F2" d="M22.46 6c-.77.35-1.6.58-2.46.69a4.3 4.3 0 001.88-2.37 8.59 8.59 0 01-2.71 1.04 4.28 4.28 0 00-7.3 3.9A12.14 12.14 0 013 4.79a4.28 4.28 0 001.33 5.72 4.24 4.24 0 01-1.94-.54v.05a4.28 4.28 0 003.43 4.2c-.49.13-1.01.2-1.54.08a4.28 4.28 0 003.99 2.97A8.58 8.58 0 012 19.54 12.1 12.1 0 008.29 21c7.55 0 11.68-6.26 11.68-11.68v-.53A8.36 8.36 0 0022.46 6z"/>
          </svg>
        </a>
      </div>
    </div>
</template>

<script setup lang="ts">
import { useDrawer } from '@/composables/useDrawer'
import { ref, onMounted, onBeforeUnmount } from 'vue'
const { drawerOpen } = useDrawer()

const isDesktop = ref(typeof window !== 'undefined' && window.innerWidth >= 900)

function updateIsDesktop() {
  isDesktop.value = typeof window !== 'undefined' && window.innerWidth >= 900
}

onMounted(() => {
  updateIsDesktop()
  window.addEventListener('resize', updateIsDesktop)
})
onBeforeUnmount(() => window.removeEventListener('resize', updateIsDesktop))

defineProps<{
  activeView?: 'landing'|'about'|'dashboard'|'warframes'|'weapons'|'primary'|'secondary'|'melee'
}>()

const emit = defineEmits<{
  (e: 'navigate', view: 'landing'|'about'|'dashboard'|'warframes'|'weapons'|'primary'|'secondary'|'melee'): void
}>()

function navigate(view: 'landing'|'about'|'dashboard'|'warframes'|'weapons'|'primary'|'secondary'|'melee') {
  drawerOpen.value = false
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

/* accents */
.nav-dashboard { --accent: #7c4dff }
.nav-warframes { --accent: #9b5cff }
.nav-weapons { --accent: #00bfff }
.nav-home { --accent: #00ffff }
.nav-about { --accent: #6ee7b7 }

.nav-socials {
  position: fixed;
  left: 18px;
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

/* mobile adjustments */
@media (max-width: 720px) {
  .nav-socials { display: none }

  /* collapsed narrow sidebar when not opened */
  .sidebar {
    width: 64px;
    padding: 12px 8px;
  }
  .nav-btn span { display: none }

  /* mobile toggle button */
  .mobile-toggle {
    display: inline-flex;
    align-items:center;
    justify-content:center;
    width:36px;
    height:36px;
    border-radius:8px;
    background: transparent;
    border:none;
    color: inherit;
    margin-bottom: 10px;
    cursor: pointer;
    z-index: 40;
  }

  .mobile-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.45);
    z-index: 30;
  }

  /* when mobile-open, show as overlay panel */
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    transform: translateX(-110%);
    transition: transform 220ms ease;
    width: 78vw;
    max-width: 320px;
    padding: 18px 12px;
    z-index: 35;
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }
}

</style>
