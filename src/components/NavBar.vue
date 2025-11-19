<template>
  <div>
    <!-- Desktop: render a plain persistent sidebar so we don't depend on Quasar QLayout -->
    <aside v-if="isDesktop" class="sidebar" aria-label="Main navigation">
      <div class="brand">Arsenal Tracker</div>
      <nav id="main-nav" class="links">
        <button class="nav-btn" @click="navigate('landing')" :class="{ active: activeView === 'landing' }">
          <svg viewBox="0 0 24 24" aria-hidden focusable="false"><path d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-8.5z" fill="currentColor"/></svg>
          <span>Home</span>
        </button>

        <button class="nav-btn" @click="navigate('dashboard')" :class="{ active: activeView === 'dashboard' }">
          <svg viewBox="0 0 24 24" aria-hidden focusable="false"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor"/></svg>
          <span>Dashboard</span>
        </button>

        <button class="nav-btn" @click="navigate('about')" :class="{ active: activeView === 'about' }">
          <svg viewBox="0 0 24 24" aria-hidden focusable="false"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="currentColor"/></svg>
          <span>About</span>
        </button>

        <hr />

        <button class="nav-btn" @click="navigate('warframes')" :class="{ active: activeView === 'warframes' }">
          <svg viewBox="0 0 24 24" aria-hidden focusable="false"><path d="M12 2l4 7h-8l4-7zm0 4.5L9.2 11h5.6L12 6.5zM4 13c0 5 3 8 8 9 5-1 8-4 8-9H4z" fill="currentColor"/></svg>
          <span>Warframes</span>
        </button>

        <button class="nav-btn" @click="navigate('weapons')" :class="{ active: activeView === 'weapons' }">
          <svg viewBox="0 0 24 24" aria-hidden focusable="false"><path d="M3 21l6-6 3 3 9-9 3 3-12 12-6-6z" fill="currentColor"/></svg>
          <span>All Weapons</span>
        </button>

        <button class="nav-btn" @click="navigate('primary')" :class="{ active: activeView === 'primary' }">
          <svg viewBox="0 0 24 24" aria-hidden focusable="false"><path d="M2 12h20v2H2zM6 6h12v2H6z" fill="currentColor"/></svg>
          <span>Primary</span>
        </button>

        <button class="nav-btn" @click="navigate('secondary')" :class="{ active: activeView === 'secondary' }">
          <svg viewBox="0 0 24 24" aria-hidden focusable="false"><path d="M3 6h18v2H3zM7 12h10v2H7zM11 18h2v2h-2z" fill="currentColor"/></svg>
          <span>Secondary</span>
        </button>

        <button class="nav-btn" @click="navigate('melee')" :class="{ active: activeView === 'melee' }">
          <svg viewBox="0 0 24 24" aria-hidden focusable="false"><path d="M12 2l3 7h7l-5.5 4 2 8L12 17 5.5 21l2-8L2 9h7z" fill="currentColor"/></svg>
          <span>Melee</span>
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

          <q-item clickable v-close-popup @click="navigate('dashboard')" :class="{ active: activeView === 'dashboard' }">
            <q-item-section avatar>
              <q-icon name="dashboard" />
            </q-item-section>
            <q-item-section>Dashboard</q-item-section>
          </q-item>

          <q-item clickable v-close-popup @click="navigate('about')" :class="{ active: activeView === 'about' }">
            <q-item-section avatar>
              <q-icon name="info" />
            </q-item-section>
            <q-item-section>About</q-item-section>
          </q-item>

          <q-separator />

          <q-item clickable v-close-popup @click="navigate('warframes')" :class="{ active: activeView === 'warframes' }">
            <q-item-section avatar>
              <q-icon name="extension" />
            </q-item-section>
            <q-item-section>Warframes</q-item-section>
          </q-item>

          <q-item clickable v-close-popup @click="navigate('weapons')" :class="{ active: activeView === 'weapons' }">
            <q-item-section avatar>
              <q-icon name="settings_ethernet" />
            </q-item-section>
            <q-item-section>All Weapons</q-item-section>
          </q-item>

          <q-item clickable v-close-popup @click="navigate('primary')" :class="{ active: activeView === 'primary' }">
            <q-item-section avatar>
              <q-icon name="sports_kabaddi" />
            </q-item-section>
            <q-item-section>Primary</q-item-section>
          </q-item>

          <q-item clickable v-close-popup @click="navigate('secondary')" :class="{ active: activeView === 'secondary' }">
            <q-item-section avatar>
              <q-icon name="handyman" />
            </q-item-section>
            <q-item-section>Secondary</q-item-section>
          </q-item>

          <q-item clickable v-close-popup @click="navigate('melee')" :class="{ active: activeView === 'melee' }">
            <q-item-section avatar>
              <q-icon name="sports_mma" />
            </q-item-section>
            <q-item-section>Melee</q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-drawer>
  </div>
</template>

<script setup lang="ts">
import { useDrawer } from '@/composables/useDrawer'
import { ref, onMounted, onBeforeUnmount } from 'vue'
const { drawerOpen } = useDrawer()

const isDesktop = ref(false)

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
.nav-primary { --accent: #ffd54a }
.nav-secondary { --accent: #9b5cff }
.nav-melee { --accent: #2bb673 }
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
