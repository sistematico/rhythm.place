<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Form from './components/form.vue';
import Plyr from './components/audio.vue';
import Dropdown from './components/dropdown.vue';

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
      <div>
        <Dropdown />
      </div>
      <div>
        <Plyr />
      </div>
      <div>
        <div class="container-iframe"> 
          <iframe class="responsive-iframe" src="https://gamja.somdomato.com/?channels=%23rhythm&nick=%7Brhythm_*%7D" />
        </div>
      </div>
      <div>
        <Form />
      </div>
    </div>
  </div>
  <div class="scrollingBG"></div>
</template>
<style scoped lang="scss">
$color: v-bind(color);

.container-iframe {
  position: relative;
  width: 100%;
  overflow: hidden;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
}

.responsive-iframe {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
  border: none;
}

// .controls {
//   display: grid;
//   // grid-gap: 1rem;
//   grid-template-columns: repeat(auto-fit, minmax(1fr, 1fr));
// }

.controls div {
  margin: 10px;
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
