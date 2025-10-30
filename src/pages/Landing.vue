<template>
  <section class="landing-root" ref="root">
    <h1 class="landing-title">Warframe Tracker</h1>
    <p class="landing-sub">Track, collect, and organize your Warframe items with ease.</p>
    <div class="buttons">
      <button class="btn btn-primary" @click="onGetStarted">Get Started</button>
      <button class="btn btn-secondary" @click="onLearnMore">Learn More</button>
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
const particles: HTMLElement[] = []
let spawnInterval: number | null = null

function onGetStarted() {
  emit('navigate', 'dashboard')
}

function onLearnMore() {
  emit('navigate', 'about')
}

function createParticle(container: HTMLElement) {
  const colors = ['#00ffff', '#00bfff', '#7c4dff', '#6ee7b7']
  const p = document.createElement('div')
  const size = Math.random() * 6 + 2 // size range: 2 - 8px
  const color = colors[Math.floor(Math.random() * colors.length)] ?? '#00ffff'
  const opacity = (Math.random() * 0.35 + 0.15).toFixed(2) // 0.15 - 0.5
  const duration = (6 + Math.random() * 12).toFixed(2) // 6 - 18s
  p.className = 'particle'
  // Inline styles ensure dynamically-created elements are visible and animated
  p.style.position = 'absolute'
  p.style.width = `${size}px`
  p.style.height = `${size}px`
  p.style.left = `${Math.random() * 100}vw`
  p.style.top = `${Math.random() * 100}vh`
  p.style.background = color
  p.style.borderRadius = '50%'
  p.style.opacity = String(opacity)
  // compute a random movement vector so particles travel in arbitrary directions
  const angle = Math.random() * Math.PI * 2
  const maxDim = Math.max(window.innerWidth, window.innerHeight)
  const distance = maxDim * (0.6 + Math.random() * 1.4) // ensures movement reaches off-screen
  const dx = Math.cos(angle) * distance
  const dy = Math.sin(angle) * distance
  p.style.setProperty('--dx', `${dx}px`)
  p.style.setProperty('--dy', `${dy}px`)
  p.style.willChange = 'transform, opacity'
  p.style.animationName = 'float'
  p.style.animationTimingFunction = 'linear'
  p.style.animationIterationCount = 'infinite'
  p.style.animationDelay = `${Math.random() * 10}s`
  p.style.animationDuration = `${duration}s`
  // subtle glow based on size and color
  p.style.boxShadow = `0 0 ${Math.max(6, size * 2)}px ${color}55`
  p.style.zIndex = '0'
  p.style.pointerEvents = 'none'
  container.appendChild(p)
  particles.push(p)
  return p
}

onMounted(() => {
  const container = root.value ?? document.body
  // base initial burst, then spawn continuously while mounted
  const initialCount = Math.min(1200, Math.max(200, Math.floor((window.innerWidth * window.innerHeight) / 3000)))
  const maxParticles = Math.max(initialCount, 1600)

  for (let i = 0; i < initialCount; i++) createParticle(container)

  // spawn a few particles frequently to maintain density without unbounded growth
  spawnInterval = window.setInterval(() => {
    // small batch spawn to keep movement feeling organic
    const batch = 6
    for (let i = 0; i < batch && particles.length < maxParticles; i++) createParticle(container)
  }, 250)
})

onUnmounted(() => {
  if (spawnInterval != null) {
    window.clearInterval(spawnInterval)
    spawnInterval = null
  }
  for (const p of particles) p.remove()
  particles.length = 0
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
</style>

<style>
.particle { position: absolute; background: #00ffff; border-radius: 50%; opacity: 0.4 }
@keyframes float { from { transform: translate(0, 0); opacity: 0 } 20% { opacity: 1 } to { transform: translate(var(--dx), var(--dy)); opacity: 0 } }
</style>