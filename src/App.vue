<script setup>
import Player from './components/player.vue'
const logo = new URL('./assets/img/logo.svg', import.meta.url).href
</script>
<template>
  <div>
    <a href="https://rhythm.place">
      <img :src="logo" class="logo" alt="Rhythm Place" />
    </a>
  </div>
  <Player />
</template>