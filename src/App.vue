<script setup>
import Player from './components/player.vue'
</script>
<template>
  <div>
    <a href="https://rhythm.place">
      <img src="img/logo.svg" class="logo" alt="Rhythm Place" />
    </a>
  </div>
  <Player />
</template>
<style scoped>
.logo {
  /* padding: 1.5em; */
  will-change: filter;
  transition: filter 300ms;
 
  width: 100%;
  max-width: 600px;
  height: auto;

}
.logo:hover { filter: drop-shadow(0 0 2em #42b883aa); /* #646cffaa */ }
</style>
