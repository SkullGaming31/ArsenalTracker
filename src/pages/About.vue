<template>
  <section class="about-page">
    <div class="about-hero">
      <div class="hero-left">
        <h1>ArsenalTracker</h1>
        <p class="subtitle">Track collection & mastery progress for Warframe items — fast, private, and client-side.</p>
        <p class="lede">ArsenalTracker stores per-item overrides locally so your progress stays in your browser. Export or import backups when you need to move or share your collection.</p>
        <div class="hero-ctas">
          <button class="btn btn-primary" @click="onGetStarted">Get Started</button>
          <button class="btn btn-ghost" @click="onHow">How it works</button>
          <button class="btn btn-ghost" @click="onHelp">Help & Support</button>
        </div>
      </div>
      <aside class="hero-card">
        <h4>Project</h4>
        <div class="card-row"><strong>License</strong><span>MIT</span></div>
        <div class="card-row"><strong>LocalStorage</strong><span><code>arsenaltracker.v1</code></span></div>
        <div class="card-row"><strong>Version</strong><span>0.1.0</span></div>
        <div class="card-divider" />
        <h4>Core features</h4>
        <ul class="features">
          <li><strong>Collection</strong><span>Track parts, blueprints, and crafted status</span></li>
          <li><strong>Mastery</strong><span>Mark mastered items and view progress</span></li>
          <li><strong>Import / Export</strong><span>CSV / JSON import + export for backups</span></li>
        </ul>
      </aside>
    </div>

    <div class="about-body">
      <section id="how-it-works" class="features-grid">
        <article class="feature">
          <div class="icon">
            <svg viewBox="0 0 24 24" aria-hidden><path d="M12 2l4 7H8l4-7zm0 4l-2.8 4h5.6L12 6z" fill="currentColor"/></svg>
          </div>
          <h3>Simple persistence</h3>
          <p>All data is stored locally using a versioned payload. No account, no server — your data stays with you.</p>
        </article>

        <article class="feature">
          <div class="icon">
            <svg viewBox="0 0 24 24" aria-hidden><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10z" fill="currentColor"/></svg>
          </div>
          <h3>Flexible imports</h3>
          <p>Import CSV or JSON exports from other sources. The importer will propose a preview before applying changes.</p>
        </article>

        <article class="feature">
          <div class="icon">
            <svg viewBox="0 0 24 24" aria-hidden><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-6h2v6z" fill="currentColor"/></svg>
          </div>
          <h3>Privacy-first</h3>
          <p>No telemetry or remote storage. You control backups and sharing using export/import features.</p>
        </article>
      </section>

      <section class="usage">
        <h3>Usage — Getting started</h3>
        <ol>
          <li>Open the Warframes or Weapons pages from the navigation.</li>
          <li>Use the search box to find an item, then toggle collected/mastered flags on the item card.</li>
          <li>Use the header filters to hide completed items or refine your view.</li>
        </ol>
      </section>

      <section class="backup">
        <h3>Backup & Restore</h3>
        <p class="muted">Use the Import / Export controls on the Dashboard to export a JSON or CSV backup. Import will show a preview before applying changes.</p>
      </section>

      <section class="privacy">
        <h3>Privacy & Local storage</h3>
        <p>All data is stored locally in your browser under the key <code>arsenaltracker.v1</code>. Clearing your browser storage will remove this data. No data is sent to our servers.</p>
      </section>

      <section class="troubleshoot">
        <h3>Troubleshooting</h3>
        <ul>
          <li>If imports fail, check that the file is valid CSV/JSON and try again.</li>
          <li>To reset local overrides, use the "Clear Local Overrides" button on the Dashboard.</li>
          <li>If layout looks broken, try a hard refresh (Ctrl+F5) or clear site data in your browser.</li>
        </ul>
      </section>

      <section class="support">
        <h3>Help & Support</h3>
        <p class="muted">Join the community on Discord for questions and support.</p>
        <div class="contrib-list">
          <button class="btn btn-ghost" @click="onHelp">Open Discord</button>
        </div>
      </section>

      <div class="about-footer">
        <button class="btn" @click="onBack">Back to Home</button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineOptions({ name: 'AboutPage' })
const emit = defineEmits<{
  (e: 'navigate', view: 'landing'|'dashboard'|'warframes'|'weapons'|'primary'|'secondary'|'melee'|'about'): void
}>()

function onBack() {
  emit('navigate', 'landing')
}

function onGetStarted() {
  emit('navigate', 'dashboard')
}

function onHow() {
  const el = document.querySelector('#how-it-works') as HTMLElement | null
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function onHelp() {
  // open the community discord in a new tab
  try {
    window.open('https://discord.com/invite/6TGV75sDjW', '_blank')
  } catch {
    // fallback: navigate to dashboard so user can find socials
    emit('navigate', 'dashboard')
  }
}
</script>

<style scoped>
.about-page { color: #dfeee6; padding: 36px 18px 80px; }
.about-hero { display:flex; gap:24px; align-items:stretch; max-width:1200px; margin: 0 auto 28px }
.hero-left { flex:1; padding:28px 18px }
.hero-left h1 { font-size:2.1rem; margin:0 0 8px; color: #fff }
.subtitle { color: #9fcfb0; margin-bottom:8px }
.lede { color:#cfe8d6; margin-bottom:18px; max-width:56ch }
.hero-ctas { display:flex; gap:12px; margin-top:8px }
.btn { padding:10px 14px; border-radius:8px; border:0; cursor:pointer }
.btn-primary { background: linear-gradient(90deg,#7c4dff,#00bfff); color:#fff }
.btn-ghost { background: transparent; border:1px solid rgba(255,255,255,0.04); color:#cfe8d6; padding:8px 12px; border-radius:8px }
.hero-card { width:320px; background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.008)); border-radius:12px; padding:16px; border:1px solid rgba(255,255,255,0.03) }
.hero-card h4 { margin:0 0 8px; color:#fff }
.card-row { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.02) }
.card-row strong { color:#cfe8d6 }
.card-divider { height:8px }
.features { list-style:none; padding:0; margin:8px 0 0 }
.features li { padding:6px 0; color:#bfe5cf }

.about-body { max-width:1200px; margin: 0 auto }
.features-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:18px; margin-bottom:28px }
.feature { background: linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.006)); border:1px solid rgba(255,255,255,0.02); padding:18px; border-radius:10px }
.feature .icon { width:44px; height:44px; display:flex; align-items:center; justify-content:center; background: rgba(255,255,255,0.02); border-radius:8px; margin-bottom:10px }
.feature h3 { margin:0 0 8px }
.feature p { color:#cbdcc8; margin:0 }

.contributors { margin-bottom:22px }
.contrib-list { display:flex; gap:12px; align-items:center }
.contrib { background: rgba(255,255,255,0.02); padding:8px 12px; border-radius:8px }
.muted { color:#9fb8a6 }

.about-footer { margin-top:18px }

@media (max-width: 880px) {
  .about-hero { flex-direction:column }
  .hero-card { width:100% }
}
</style>
