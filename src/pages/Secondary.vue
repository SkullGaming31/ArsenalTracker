<template>
  <div class="page">
    <h2>Secondary Weapons</h2>
    <div class="grid">
      <WeaponCard v-for="w in secondaries" :key="w.name" :weapon="w" />
    </div>
    <div class="names"><ul><li v-for="w in secondaries" :key="w.name">{{ w.name }}</li></ul></div>
  </div>
</template>

<script setup lang="ts">
import weapons from '../data/weapons.json'
import WeaponCard from '../components/WeaponCard.vue'
import type { Weapon } from '../types/weapon'
const all = weapons as Weapon[]
const secondaries = all.filter(w => w.category === 'secondary') as Weapon[]
</script>

<style scoped>
.grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap:12px }
</style>
