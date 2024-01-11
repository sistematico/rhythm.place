<script setup lang="ts">
import { ref, onMounted } from "vue";
import Plyr from "./components/audio.vue";
import Dropdown from "./components/dropdown.vue";

const colors: string[] = ['#00cff8', '#3ef800', '#d513b2']
const color = ref('#00cff8')

const getRandomElement = (arr: string[]) => arr.length ? arr[Math.floor(Math.random() * arr.length)] : '#00cff8'

onMounted(() => {
  color.value = getRandomElement(colors)
})
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
    <div class="controls">
      <Dropdown />
      <Plyr />
    </div>
  </div>
  <div class="scrollingBG"></div>
</template>
<style scoped lang="scss">
$color: v-bind(color);

.controls {
  display: flex;
}

.neon {
  font-family: "Streamster";
  max-width: 100%;
  color: #fff;
  font-size: 10vmin;
  text-shadow: 0 0 8px #fff, 0 0 24px #fff, 0 0 32px $color, 0 0 40px $color;
  inset: 0;
  transform: rotate(-8deg);
}

span:nth-child(1) {
  animation: neon 1.7s infinite alternate;
}

span:nth-child(2) {
  animation: neon 1.7s infinite alternate-reverse;
}

@keyframes neon {
  0%,
  18%,
  22%,
  26%,
  58%,
  62%,
  100% {
    text-shadow: 0 0 8px #fff, 0 0 24px #fff, 0 0 32px $color, 0 0 40px $color;
  }
  20%,
  24%,
  60% {
    text-shadow: none;
  }
}
</style>
