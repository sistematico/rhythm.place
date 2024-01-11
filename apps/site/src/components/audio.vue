<script setup lang="ts">
import { ref, watch, onUnmounted, onMounted } from "vue";
import { store } from "../store.ts";
import VuePlyr from "@skjnldsv/vue-plyr";

const STREAM_URL = `${import.meta.env.VITE_STREAM_URL}`;
const JSON_URL = `${STREAM_URL}/status-json.xsl`;
let ts = (Date.now() / 1000) | 0;
let currentSource = null;
const streamSource = ref(`${STREAM_URL}/${store.genre}?ts=${ts}`);
const listeners = ref("0");
const listenersPeak = ref("0");
const plyr = ref(null);

let timerId = setInterval(async () => {
  const { icestats: { source } } = await (await fetch(JSON_URL)).json();
  currentSource = await source.find((element: { genre: string; }) => element.genre === store.genre.charAt(0).toUpperCase() + store.genre.slice(1));

  if (currentSource) {
    listeners.value = currentSource.listeners;
    listenersPeak.value = currentSource.listener_peak;
    document.querySelector(".plyr__title").innerHTML = currentSource.title;
  }

  // function getKeyByValue(object, value) {
  // console.log(Object.keys(source).find(key => source[key] === 'dance'))
  // console.log(Object.keys(source).find(key => source[key].genre === 'dance'))
// }


  if (!plyr.value.player.playing) {
    ts = (Date.now() / 1000) | 0;
    document.querySelector("audio").load();
    streamSource.value = `${STREAM_URL}/${store.genre}?ts=${ts}`;
  }
}, 1000);

const controls = `
<div class="plyr__controls">
  <button id="restart" type="button" class="plyr__control" data-plyr="restart">
    <svg role="presentation"><use xlink:href="#plyr-restart"></use></svg>
    <span class="plyr__tooltip" role="tooltip">Restart</span>
  </button>
  <button type="button" class="plyr__control" aria-label="Play, {title}" data-plyr="play">
    <svg class="icon--pressed" role="presentation"><use xlink:href="#plyr-pause"></use></svg>
    <svg class="icon--not-pressed" role="presentation"><use xlink:href="#plyr-play"></use></svg>
    <span class="label--pressed plyr__tooltip" role="tooltip">Pause</span>
    <span class="label--not-pressed plyr__tooltip" role="tooltip">Play</span>
  </button>
  <div class="plyr__title" aria-label="Title">Rhythm Place</div>
  <button type="button" class="plyr__control" aria-label="Mute" data-plyr="mute">
    <svg class="icon--pressed" role="presentation"><use xlink:href="#plyr-muted"></use></svg>
    <svg class="icon--not-pressed" role="presentation"><use xlink:href="#plyr-volume"></use></svg>
    <span class="label--pressed plyr__tooltip" role="tooltip">Unmute</span>
    <span class="label--not-pressed plyr__tooltip" role="tooltip">Mute</span>
  </button>
  <div class="plyr__volume">
    <input data-plyr="volume" type="range" min="0" max="1" step="0.05" value="1" autocomplete="off" aria-label="Volume">
  </div>
  <button type="button" class="plyr__control" data-plyr="captions">
    <svg class="icon--pressed" role="presentation"><use xlink:href="#plyr-captions-on"></use></svg>
    <svg class="icon--not-pressed" role="presentation"><use xlink:href="#plyr-captions-off"></use></svg>
    <span class="label--pressed plyr__tooltip" role="tooltip">Disable captions</span>
    <span class="label--not-pressed plyr__tooltip" role="tooltip">Enable captions</span>
  </button>
  <button type="button" class="plyr__control" data-plyr="fullscreen">
    <svg class="icon--pressed" role="presentation"><use xlink:href="#plyr-exit-fullscreen"></use></svg>
    <svg class="icon--not-pressed" role="presentation"><use xlink:href="#plyr-enter-fullscreen"></use></svg>
    <span class="label--pressed plyr__tooltip" role="tooltip">Exit fullscreen</span>
    <span class="label--not-pressed plyr__tooltip" role="tooltip">Enter fullscreen</span>
  </button>
</div>
`;

const plyrOptions = {
  title: "Rhythm Place",
  controls,
};

function changeGenre(genre: string) {
  const ts = (Date.now() / 1000) | 0;
  streamSource.value = `${STREAM_URL}/${genre}?ts=${ts}`;
  document.querySelector("audio").load();
  plyr.value.player.play();
}

watch(
  () => store.genre,
  () => {
    console.log(store.genre);
    changeGenre(store.genre);
  }
);

onMounted(() => {
  const restart = document.getElementById("restart");
  restart?.addEventListener("click", function () {
    ts = (Date.now() / 1000) | 0;
    streamSource.value = `${STREAM_URL}/${store.genre}?ts=${ts}`;
    document.querySelector("audio").load();
    plyr.value.player.play();
  });
});

onUnmounted(() => {
  clearInterval(timerId);
});
</script>
<template>
  <div class="player-container">
    <vue-plyr ref="plyr" :options="plyrOptions">
      <audio controls crossorigin="anonymous" playsinline>
        <source :src="streamSource" type="audio/mp3" />
      </audio>
    </vue-plyr>
    <div class="stats">Ouvintes: {{ listeners }} Pico: {{ listenersPeak }}</div>
  </div>
</template>
<style>
/* .player-container {
  display: block;  Usar bloco em vez de flex 
  padding: 10px;
} */
</style>
