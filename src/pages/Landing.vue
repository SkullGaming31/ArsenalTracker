<template>
  <section class="landing-root" ref="root">
    <h1 class="landing-title">Warframe Tracker</h1>
    <p class="landing-sub">Track, collect, and organize your Warframe items with ease.</p>
    <div class="buttons">
      <q-btn color="primary" unelevated label="Get Started" @click="onGetStarted" />
      <q-btn flat outline color="secondary" label="Learn More" @click="onLearnMore" />
    </div>
    <div class="landing-controls">
      <q-toggle v-model="particlesEnabled" dense label="Particles" @update:model-value="onParticlesToggle" />
    </div>
  </section>
</template>

<script setup lang="ts">
defineOptions({ name: 'LandingPage' })
import { onMounted, onUnmounted, ref } from 'vue'

const emit = defineEmits<{
  (e: 'navigate', view: 'dashboard'|'warframes'|'weapons'|'primary'|'secondary'|'melee'|'landing'|'about'): void
}>()

const root = ref<HTMLElement | null>(null)
const particlesEnabled = ref<boolean>(true)

// particle settings — tweak these to lower density / frequency
const PARTICLE_SETTINGS = {
  // lower divisor -> more particles; increase to reduce particles
  initialDensityDivisor: 40000, // default was ~20000 in original logic
  maxCap: 300,
  spawnBatch: 1,
  spawnIntervalMs: 1200,
  mobileScale: 0.35,
}

// particle pooling to avoid unbounded DOM growth and repeated allocations
const particles: HTMLElement[] = []
const particlePool: HTMLElement[] = []
let spawnInterval: number | null = null
const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false

function onGetStarted() {
  emit('navigate', 'dashboard')
}

function onLearnMore() {
  emit('navigate', 'about')
}

function createParticle(container: HTMLElement) {
  const colors = ['#00ffff', '#00bfff', '#7c4dff', '#6ee7b7']
  // reuse from pool when available
  let p: HTMLElement | undefined = particlePool.pop()
  const size = Math.random() * 6 + 2 // size range: 2 - 8px
  const color = colors[Math.floor(Math.random() * colors.length)] ?? '#00ffff'
  const opacity = (Math.random() * 0.35 + 0.15).toFixed(2) // 0.15 - 0.5
  const duration = (6 + Math.random() * 12).toFixed(2) // 6 - 18s

  if (!p) {
    p = document.createElement('div')
    p.className = 'particle'
    p.style.position = 'absolute'
    p.style.borderRadius = '50%'
    p.style.willChange = 'transform, opacity'
    p.style.zIndex = '0'
    p.style.pointerEvents = 'none'
    container.appendChild(p)
    // newly created elements should be tracked as active
    particles.push(p)
  } else {
    // reused from pool: mark as active
    if (particles.indexOf(p) === -1) particles.push(p)
  }

  // compute random vector
  const angle = Math.random() * Math.PI * 2
  const maxDim = Math.max(window.innerWidth, window.innerHeight)
  const distance = maxDim * (0.6 + Math.random() * 1.4)
  const dx = Math.cos(angle) * distance
  const dy = Math.sin(angle) * distance

  // apply styles to reuse element
  p.style.width = `${size}px`
  p.style.height = `${size}px`
  p.style.left = `${Math.random() * 100}vw`
  p.style.top = `${Math.random() * 100}vh`
  p.style.background = color
  p.style.opacity = String(opacity)
  p.style.setProperty('--dx', `${dx}px`)
  p.style.setProperty('--dy', `${dy}px`)
  p.style.animationName = 'float'
  p.style.animationTimingFunction = 'linear'
  p.style.animationIterationCount = 'infinite'
  p.style.animationDelay = `${Math.random() * 10}s`
  p.style.animationDuration = `${duration}s`
  p.style.boxShadow = `0 0 ${Math.max(6, size * 2)}px ${color}55`

  return p
}

onMounted(() => {
  // Read persisted preference (landing-specific toggle). If user has an explicit setting
  // stored in localStorage, use it; otherwise respect prefers-reduced-motion.
  const storedPref = typeof window !== 'undefined' ? window.localStorage.getItem('ui.particles.enabled') : null
  if (storedPref === 'false') {
    particlesEnabled.value = false
    return
  }
  if (storedPref === 'true') {
    particlesEnabled.value = true
  }
  if (prefersReducedMotion && storedPref !== 'true') {
    particlesEnabled.value = false
    return
  }

  const container = root.value ?? document.body
  // base initial burst, scaled down to reduce particle density by default
  const viewportArea = Math.max(800, window.innerWidth) * Math.max(600, window.innerHeight)
  const isMobile = window.innerWidth <= 720
  const baseInitial = Math.floor(viewportArea / PARTICLE_SETTINGS.initialDensityDivisor)
  const initialCount = Math.min(PARTICLE_SETTINGS.maxCap, Math.max(12, Math.floor(baseInitial * (isMobile ? PARTICLE_SETTINGS.mobileScale : 1))))
  const maxParticles = Math.max(initialCount, Math.min(PARTICLE_SETTINGS.maxCap, initialCount * 2))

  // create initial pool up to maxParticles but only attach initialCount visible ones
  for (let i = 0; i < maxParticles; i++) {
    const el = document.createElement('div')
    el.className = 'particle'
    el.style.position = 'absolute'
    el.style.borderRadius = '50%'
    el.style.willChange = 'transform, opacity'
    el.style.zIndex = '0'
    el.style.pointerEvents = 'none'
    container.appendChild(el)
    particlePool.push(el)
  }

  // populate initial visible particles by reusing from pool
  for (let i = 0; i < initialCount; i++) createParticle(container)

  // spawn a few particles less frequently to maintain density without unbounded growth
  spawnInterval = window.setInterval(() => {
    const batch = PARTICLE_SETTINGS.spawnBatch
    for (let i = 0; i < batch && particles.length < maxParticles; i++) createParticle(container)
    // occasionally recycle oldest particles back into the pool to avoid growth
    if (particles.length > maxParticles) {
      const removeCount = particles.length - maxParticles
      for (let r = 0; r < removeCount; r++) {
        const rem = particles.shift()
        if (rem) particlePool.push(rem)
      }
    }
  }, PARTICLE_SETTINGS.spawnIntervalMs)
})

  // particles toggle handler (persist preference and reload to apply quickly)
  function onParticlesToggle(value: boolean) {
    try {
      window.localStorage.setItem('ui.particles.enabled', value ? 'true' : 'false')
    } catch {
      // ignore
    }
    try { location.reload() } catch { /* noop in non-browser env */ }
  }

onUnmounted(() => {
  if (spawnInterval != null) {
    window.clearInterval(spawnInterval)
    spawnInterval = null
  }
  // remove active particles and clear pool
  for (const p of particles) p.remove()
  particles.length = 0
  for (const p of particlePool) p.remove()
  particlePool.length = 0
})
</script>

<style scoped>
* { box-sizing: border-box }
.landing-root {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: 'Orbitron', sans-serif;
  color: #fff;
  background: radial-gradient(circle at 30% 30%, #1b0f40, #0b0b1e);
  overflow: hidden;
  position: relative;
}
.landing-title {
  font-size: 5rem;
  text-transform: uppercase;
  background: linear-gradient(90deg, #00bfff, #00ffff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
  animation: shimmer 4s infinite linear;
  position: relative;
  z-index: 2;
}
@keyframes shimmer { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }
.landing-sub { color: #b0b0b0; font-size: 1.5rem; text-align: center; margin-top: 1rem; max-width: 700px }
.buttons { display:flex; gap:1rem; margin-top:3rem }
.buttons { position: relative; z-index: 2 }
.landing-sub { position: relative; z-index: 2 }
.btn { padding:1rem 2.5rem; border-radius:0.75rem; font-size:1.25rem; cursor:pointer; border: none; transition: all 0.3s ease }
.btn-primary { background: linear-gradient(90deg, #007bff, #00bfff); color: white; box-shadow: 0 0 20px #007bff88 }
.btn-primary:hover { background: linear-gradient(90deg, #00bfff, #00ffff); box-shadow: 0 0 30px #00ffffaa }
.btn-secondary { background: #222; color: #00ffff; border: 1px solid #00ffff44 }
.btn-secondary:hover { background: #00ffff22; box-shadow: 0 0 20px #00ffff44 }

/* particle styles are applied globally below to ensure dynamically-created elements receive them */

@media (max-width: 720px) {
  .landing-title { font-size: 2.4rem }
  .landing-sub { font-size: 1rem }
  .buttons { flex-direction: column }
}

/* small landing control area for toggles */
.landing-controls { margin-top: 1rem; position: relative; z-index: 2 }
.control-particles { display:inline-flex; align-items:center; gap:8px; cursor:pointer }
.control-particles input[type="checkbox"] { width:16px; height:16px }
.control-particles .toggle-label { font-size:0.95rem; color: #dfefe8 }
</style>

<style>
.particle { position: absolute; background: #00ffff; border-radius: 50%; opacity: 0.4 }
@keyframes float { from { transform: translate(0, 0); opacity: 0 } 20% { opacity: 1 } to { transform: translate(var(--dx), var(--dy)); opacity: 0 } }
</style>