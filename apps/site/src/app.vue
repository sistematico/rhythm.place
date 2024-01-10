<script setup lang="ts">
import Plyr from "./components/audio.vue";
</script>
<template>
  <div class="container">
    <header>
      <div>
        <img src="/img/logotipo.svg" alt="Rhythm Place" />
      </div>
      <div class="neon">
        <span>Rhythm</span>
        <span>Place</span>
      </div>
    </header>
    <div>
      <Plyr />
    </div>
  </div>
  <div class="scrollingBG"></div>
</template>
